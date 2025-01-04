import { Injectable } from '@nestjs/common';
import { Logger, LoggerWrapper } from '@ts-core/common';
import { SelectQueryBuilder } from 'typeorm';
import { UserEntity } from '../user';
import { UserTokenEntity } from '../user';
import { TarotSpreadEntity, TarotSpreadMeaningAiEntity, TarotSpreadMeaningEntity } from '../tarot';
import { CommentEntity } from '@project/module/database/comment';
import { CommentTargetType } from '@project/common/comment';
import { TarotSpreadMeaningStatus, TarotSpreadPrivacy, TarotSpreadType } from '@project/common/tarot';
import { CoinAccounts, CoinId } from '@project/common/coin';
import { PaymentTransactionEntity } from '../payment';
import { PaymentAccountId } from '@project/common/payment';
import { User, UserAccountType, UserResource } from '@project/common/user';
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

    public async userTokenHas(token: string): Promise<boolean> {
        return !_.isNil(token) ? await UserTokenEntity.countBy({ token }) > 0 : false;
    }

    public async userTokenRemove(token: string): Promise<void> {
        if (!_.isNil(token)) {
            await UserTokenEntity.delete({ token });
        }
    }

    public async usersGetByLogin(logins: Array<string>, resource: UserResource): Promise<Array<number>> {
        let query = await UserEntity.createQueryBuilder('user');
        query.leftJoinAndSelect('user.account', 'userAccount');
        let items = await query
            .where('user.login IN (:...logins)', { logins })
            .andWhere('user.resource = :resource', { resource })
            .andWhere('userAccount.type IN (:...types)', { types: [UserAccountType.FREE, UserAccountType.DONATER] })
            .getMany();
        return items.map(item => item.id);
    }

    public async userTokensRemove(user: UserEntity): Promise<void> {
        if (_.isNil(user)) {
            return;
        }
        await UserTokenEntity.createQueryBuilder('token')
            .delete()
            .where('userId = :userId', { userId: user.id })
            .andWhere('expired < :date', { date: new Date() })
            .execute();
    }

    public async userTokensRemoveExcept(user: UserEntity, token: string): Promise<void> {
        if (_.isNil(user)) {
            return;
        }
        await UserTokenEntity.createQueryBuilder('token')
            .delete()
            .where('userId = :userId', { userId: user.id })
            .andWhere('token != :token', { token })
            .execute();
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

    public async userDonatersGet(resource?: UserResource): Promise<Array<string>> {
        let query = this.getUserQuery(null);
        this.userRelationsAdd(query);

        query.where('userAccount.type = :type', { type: UserAccountType.DONATER });
        if (!_.isNil(resource)) {
            query.andWhere('user.resource = :resource', { resource });
        }
        let items = await query.getMany();
        return items.map(item => item.login);
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

    public async tarotSpreadShowcaseGet(showcase: string): Promise<TarotSpreadEntity> {
        let query = TarotSpreadEntity.createQueryBuilder('tarotSpread');
        query.where('tarotSpread.showcase = :showcase', { showcase });
        this.tarotSpreadRelationsAdd(query);

        query.leftJoinAndSelect('tarotSpread.meaning', 'tarotSpreadMeaning');
        this.tarotSpreadMeaningRelationsAdd(query);
        return query.getOne();
    }

    public tarotSpreadsCount(userId: number): Promise<number> {
        return TarotSpreadEntity
            .createQueryBuilder('tarotSpread')
            .where('tarotSpread.userId = :userId', { userId })
            .andWhere(`tarotSpread.status IS NULL`)
            .andWhere('tarotSpread.type != :type', { type: TarotSpreadType.DAY })
            .getCount();
    }

    public tarotSpreadsPublicCount(userId: number): Promise<number> {
        return TarotSpreadEntity
            .createQueryBuilder('tarotSpread')
            .where('tarotSpread.userId = :userId', { userId })
            .andWhere(`tarotSpread.status IS NULL`)
            .andWhere('tarotSpread.type != :type', { type: TarotSpreadType.DAY })
            .andWhere('tarotSpread.privacy = :privacy', { privacy: TarotSpreadPrivacy.PUBLIC })
            .getCount();
    }

    public async tarotSpreadsMeaningCount(userId: number): Promise<number> {
        return TarotSpreadMeaningEntity
            .createQueryBuilder('tarotSpreadMeaning')
            .leftJoinAndSelect('tarotSpreadMeaning.spread', 'tarotSpread')
            // .where('tarotSpread.userId = :userId AND tarotSpread.status IS NULL', { userId })
            .where('tarotSpread.userId = :userId', { userId })
            .andWhere('tarotSpreadMeaning.status IN (:...statuses)', { statuses: [TarotSpreadMeaningStatus.APPROVED, TarotSpreadMeaningStatus.RATED] })
            .getCount();
    }

    public async tarotSpreadsMeaningInProgressCount(userId: number): Promise<number> {
        let statuses = [TarotSpreadMeaningStatus.PENDING, TarotSpreadMeaningStatus.AWAITING_MEAN, TarotSpreadMeaningStatus.IN_PROGRESS, TarotSpreadMeaningStatus.AWAITING_APPROVE, TarotSpreadMeaningStatus.PREPARED];
        return await TarotSpreadMeaningEntity
            .createQueryBuilder('tarotSpreadMeaning')
            .leftJoinAndSelect('tarotSpreadMeaning.spread', 'tarotSpread')
            .where('tarotSpread.userId = :userId AND tarotSpread.status IS NULL', { userId })
            .andWhere('tarotSpreadMeaning.status IN (:...statuses)', { statuses })
            .getCount();
    }

    public async tarotSpreadsMeaningApprovedCount(userId: number): Promise<number> {
        return TarotSpreadMeaningEntity
            .createQueryBuilder('tarotSpreadMeaning')
            .leftJoinAndSelect('tarotSpreadMeaning.spread', 'tarotSpread')
            .where('tarotSpread.userId = :userId AND tarotSpread.status IS NULL', { userId })
            .andWhere('tarotSpreadMeaning.status IN (:...statuses)', { statuses: [TarotSpreadMeaningStatus.APPROVED] })
            .getCount();
    }

    public tarotSpreadRelationsAdd<T = any>(query: SelectQueryBuilder<T>): void {
        query.leftJoinAndSelect('tarotSpread.user', 'tarotSpreadUser')
        query.leftJoinAndSelect('tarotSpreadUser.account', 'tarotSpreadUserAccount');
        query.leftJoinAndSelect('tarotSpreadUser.statistics', 'tarotSpreadUserStatistics');
        query.leftJoinAndSelect('tarotSpreadUser.preferences', 'tarotSpreadUserPreferences');
    }

    public tarotSpreadMeaningRelationsAdd<T = any>(query: SelectQueryBuilder<T>): void {
        query.leftJoinAndSelect('tarotSpreadMeaning.user', 'tarotSpreadMeaningUser')
        query.leftJoinAndSelect('tarotSpreadMeaningUser.master', 'tarotSpreadMeaningUserMaster');
        query.leftJoinAndSelect('tarotSpreadMeaningUser.account', 'tarotSpreadMeaningUserAccount');
        query.leftJoinAndSelect('tarotSpreadMeaningUser.preferences', 'tarotSpreadMeaningUserPreferences');
    }

    public tarotSpreadMeaningAiRelationsAdd<T = any>(query: SelectQueryBuilder<T>): void { }

    public async tarotSpreadMeaningGet(id: number, isNeedRelations: boolean): Promise<TarotSpreadMeaningEntity> {
        let query = TarotSpreadMeaningEntity.createQueryBuilder('tarotSpreadMeaning')
            .where('tarotSpreadMeaning.id = :id', { id });

        if (isNeedRelations) {
            this.tarotSpreadMeaningRelationsAdd(query);
            query.leftJoinAndSelect('tarotSpreadMeaning.spread', 'tarotSpread');
            this.tarotSpreadRelationsAdd(query);
        }
        return query.getOne();
    }

    public async tarotSpreadsMeaningRatingCount(userId: number): Promise<number> {
        let { tarotSpreadsMeaningRating } = await TarotSpreadMeaningEntity
            .createQueryBuilder('tarotSpreadMeaning')
            .where('tarotSpreadMeaning.userId = :userId', { userId })
            .andWhere('tarotSpreadMeaning.status = :status', { status: TarotSpreadMeaningStatus.RATED })
            .select('AVG(tarotSpreadMeaning.rating)', 'tarotSpreadsMeaningRating')
            .getRawOne();
        return Number(tarotSpreadsMeaningRating);
    }

    public async tarotSpreadMeaningInProgressCount(): Promise<number> {
        let query = TarotSpreadMeaningEntity.createQueryBuilder('tarotSpreadMeaning')
        query.leftJoinAndSelect('tarotSpreadMeaning.spread', 'tarotSpread');
        query.where('tarotSpreadMeaning.status = :status', { status: TarotSpreadMeaningStatus.IN_PROGRESS })
        query.andWhere(`tarotSpread.status IS NULL`);
        return query.getCount();
    }

    public async tarotSpreadMeaningAiGet(id: number, isNeedRelations: boolean): Promise<TarotSpreadMeaningAiEntity> {
        let query = TarotSpreadMeaningAiEntity.createQueryBuilder('tarotSpreadMeaningAi')
            .where('tarotSpreadMeaningAi.id = :id', { id });

        if (isNeedRelations) {
            this.tarotSpreadMeaningAiRelationsAdd(query);
            query.leftJoinAndSelect('tarotSpreadMeaningAi.spread', 'tarotSpread');
            this.tarotSpreadRelationsAdd(query);
        }
        return query.getOne();
    }

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

