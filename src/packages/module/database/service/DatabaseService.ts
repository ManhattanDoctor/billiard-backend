import { Injectable } from '@nestjs/common';
import { Logger, LoggerWrapper } from '@ts-core/common';
import { SelectQueryBuilder } from 'typeorm';
import { UserEntity } from '../user';
import { CommentEntity } from '@project/module/database/comment';
import { CoinAccounts, CoinId } from '@project/common/coin';
import { PaymentTransactionEntity } from '../payment';
import { PaymentAccountId } from '@project/common/payment';
import { User, UserAccountType } from '@project/common/user';
import { UserNotFoundError } from '@project/module/core/middleware';
import * as _ from 'lodash';

@Injectable()
export class DatabaseService extends LoggerWrapper {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private getUserQuery(idOrLogin: string | number): SelectQueryBuilder<UserEntity> {
        let item = UserEntity.createQueryBuilder('user');
        if (_.isString(idOrLogin)) {
            item.where('user.login = :login', { login: idOrLogin });
        }
        else if (_.isNumber(idOrLogin)) {
            item.where('user.id = :id', { id: idOrLogin });
        }
        return item;
    }

    // --------------------------------------------------------------------------
    //
    //  User Methods
    //
    // --------------------------------------------------------------------------

    public async userGet(idOrLogin: string | number, isNeedRelations: boolean): Promise<UserEntity> {
        let query = this.getUserQuery(idOrLogin);
        if (isNeedRelations) {
            this.userRelationsAdd(query);
        }
        return query.getOne();
    }

    public userRelationsAdd<T = any>(query: SelectQueryBuilder<T>): SelectQueryBuilder<T> {
        query.leftJoinAndSelect('user.master', 'userMaster');
        query.leftJoinAndSelect('user.account', 'userAccount');
        query.leftJoinAndSelect('user.statistics', 'userStatistics');
        query.leftJoinAndSelect('user.preferences', 'userPreferences');
        return query;
    }

    public async userAdministratorGet(): Promise<UserEntity> {
        let query = this.getUserQuery(null);
        this.userRelationsAdd(query);

        let item = await query.where('userAccount.type = :type', { type: UserAccountType.ADMINISTRATOR }).getOne();
        if (_.isNil(item)) {
            throw new UserNotFoundError();
        }
        return item;
    }

    public async userAdministratorIdGet(): Promise<number> {
        let { id } = await this.userAdministratorGet();
        return id;
    }

    // --------------------------------------------------------------------------
    //
    //  Tarot Spread Methods
    //
    // --------------------------------------------------------------------------

    /*
    public async tarotSpreadGet(idOrUid: string | number, isNeedRelations: boolean): Promise<TarotSpreadEntity> {
        let query = TarotSpreadEntity.createQueryBuilder('tarotSpread');
        if (_.isString(idOrUid)) {
            query.where('tarotSpread.uid = :uid', { uid: idOrUid });
        }
        else if (_.isNumber(idOrUid)) {
            query.where('tarotSpread.id = :id', { id: idOrUid });
        }

        if (isNeedRelations) {
            this.tarotSpreadRelationsAdd(query);

            query.leftJoinAndSelect('tarotSpread.meaning', 'tarotSpreadMeaning');
            this.tarotSpreadMeaningRelationsAdd(query);

            query.leftJoinAndSelect('tarotSpread.meaningAi', 'tarotSpreadMeaningAi');
            this.tarotSpreadMeaningAiRelationsAdd(query);

            query.leftJoinAndMapMany('tarotSpread.comments', CommentEntity, 'comment', `comment.targetId = tarotSpread.id AND comment.targetType = '${CommentTargetType.TAROT_SPREAD}'`);
            this.commentRelationsAdd(query);
        }

        return query.getOne();
    }
    */

    // --------------------------------------------------------------------------
    //
    //  Coin Methods
    //
    // --------------------------------------------------------------------------

    public async coinAccounts(idOrLogin: string | number): Promise<CoinAccounts> {
        let query = this.getUserQuery(idOrLogin);
        query.leftJoinAndSelect('user.coinAccounts', 'userCoinAccounts');

        let item = await query.getOne();
        let accounts = {} as any;
        for (let account of item.coinAccounts) {
            accounts[account.coinId] = account.amount;
        }
        return accounts;
    }

    public async coinBalance(userId: User | number, coinId: CoinId = CoinId.TOKEN): Promise<string> {
        if (!_.isNumber(userId)) {
            userId = userId.id;
        }
        let accounts = await this.coinAccounts(userId);
        return !_.isNil(accounts[coinId]) ? accounts[coinId] : '0';
    }

    public async getCoinAmount(userId: number, coinId: CoinId): Promise<string> {
        let account = PaymentAccountId.PR_00;
        let query = PaymentTransactionEntity
            .createQueryBuilder('transaction')
            .select(`SUM(CASE WHEN debet='${account}' THEN amount WHEN credit='${account}' THEN -amount ELSE 0 END)`, 'balance')
            .where(`transaction.coinId = :coinId`, { coinId })
            .andWhere(`transaction.userId = :userId`, { userId })
            .andWhere(`transaction.activated IS NOT NULL`)
            .groupBy('transaction.coinId');

        let item = await query.getRawOne();
        return !_.isNil(item) ? item['balance'] : '0';
    }

    // --------------------------------------------------------------------------
    //
    //  Comment Methods
    //
    // --------------------------------------------------------------------------

    public async commentGet(id: number, isNeedRelations: boolean): Promise<CommentEntity> {
        let query = CommentEntity.createQueryBuilder('comment')
            .where('comment.id = :id', { id })

        if (isNeedRelations) {
            this.commentRelationsAdd(query);
        }
        return query.getOne();
    }

    public commentRelationsAdd<T = any>(query: SelectQueryBuilder<T>): void {
        query.leftJoinAndSelect('comment.user', 'commentUser');
        query.leftJoinAndSelect('commentUser.account', 'commentUserAccount');
        query.leftJoinAndSelect('commentUser.preferences', 'commentUserPreferences');
    }

    // --------------------------------------------------------------------------
    //
    //  Payment Transaction
    //
    // --------------------------------------------------------------------------

    public paymentRelationsAdd<T = any>(query: SelectQueryBuilder<T>): void {
        query.leftJoinAndSelect('payment.user', 'paymentUser');
        query.leftJoinAndSelect('paymentUser.account', 'paymentUserAccount');
        query.leftJoinAndSelect('paymentUser.preferences', 'paymentUserPreferences');

        query.leftJoinAndSelect('payment.transactions', 'paymentPaymentTransactions');
    }

    public paymentTransactionRelationsAdd<T = any>(query: SelectQueryBuilder<T>): void { }

}

