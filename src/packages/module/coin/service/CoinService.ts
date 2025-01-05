import { Injectable } from '@nestjs/common';
import { CoinBonusDto } from '@project/common/api/coin';
import { CoinAccounts, CoinBonusType, CoinId, ICoinBonus } from '@project/common/coin';
import { LoginUtil } from '@project/common/login';
import { PaymentTransactionType } from '@project/common/payment';
import { User } from '@project/common/user';
import { CoinAccountUpdateCommand } from '@project/module/coin/transport';
import { PaymentTransactionEntity } from '@project/module/database/payment';
import { DatabaseService } from '@project/module/database/service';
import { UserEntity } from '@project/module/database/user';
import { VkStrategyInternal } from '@project/module/login/strategy';
import { Logger, Transport, MathUtil, DateUtil, LoggerWrapper } from '@ts-core/common';
import * as _ from 'lodash';
import { IUserDetails } from '@project/common/api/user';
import { RequestInvalidError } from '@project/module/core/middleware';

@Injectable()
export class CoinService extends LoggerWrapper {
    // --------------------------------------------------------------------------
    //
    //  Constants
    //
    // --------------------------------------------------------------------------

    public static DAILY_BONUS = '1';
    public static REGISTRATION_BONUS = '5';
    public static VK_IS_FAVORITE_BONUS = '1';
    public static VK_PROFILE_BUTTON_BONUS = '1';

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private transport: Transport, private database: DatabaseService, private vkInternalStrategy: VkStrategyInternal) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private async getDailyBonus(user: UserEntity, details?: IUserDetails): Promise<ICoinBonus> {
        let amount = MathUtil.add(CoinService.DAILY_BONUS, await this.getVkAddinitionalAmount(user, details));
        let item = await PaymentTransactionEntity.saveEntity(user.id, PaymentTransactionType.DAILY_BONUS, CoinId.TOKEN, amount);
        return { type: CoinBonusType.DAILY, coinId: item.coinId, amount };
    }

    private async getRegistrationBonus(user: UserEntity): Promise<ICoinBonus> {
        let item = await PaymentTransactionEntity.saveEntity(user.id, PaymentTransactionType.REGISTRATION_BONUS, CoinId.TOKEN, CoinService.REGISTRATION_BONUS);
        return { type: CoinBonusType.REGISTRATION, coinId: item.coinId, amount: item.amount };
    }

    private async getVkAddinitionalAmount(user: UserEntity, details: IUserDetails): Promise<string> {
        let item = '0';
        if (_.isNil(details) || _.isEmpty(details.vkInternalParams)) {
            return item;
        }
        try {
            let params = this.vkInternalStrategy.checkSignature(details.vkInternalParams);
            let userId = LoginUtil.getIdByLogin(user.login, user.resource);
            let vkUserId = params.get('vk_user_id');
            if (vkUserId !== userId) {
                throw new RequestInvalidError({ name: 'vk_user_id', value: vkUserId, expected: userId });
            }
            if (params.get('vk_has_profile_button') === '1') {
                item = MathUtil.add(item, '1');
            }
            if (params.get('vk_is_favorite') === '1') {
                item = MathUtil.add(item, '1');
            }
        }
        catch (error) {
            this.warn(`Unable to add VK bonuses: ${error.message}`);
        }
        finally {
            return item;
        }
    }

    private getBonusNextDate(user: UserEntity): Date {
        let item = DateUtil.getDate(Date.now() + DateUtil.MILLISECONDS_DAY);
        item.setHours(0, 0, 0, 0);
        return item;
    }

    private isNeedRegistrationBonus(user: UserEntity): boolean {
        return _.isNil(user.lastLogin);
    }

    private isNeedDailyBonus(user: UserEntity): boolean {
        if (_.isNil(user.lastLogin)) {
            return false;
        }

        let loginDate = new Date();
        let lastLogin = new Date(user.lastLogin);

        lastLogin.setHours(0, 0, 0, 0);
        loginDate.setHours(0, 0, 0, 0);
        return loginDate.getDate() !== lastLogin.getDate();
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async getAccounts(idOrLogin: string | number): Promise<CoinAccounts> {
        return this.database.coinAccounts(idOrLogin);
    }

    public async getBonuses(user: UserEntity, details?: IUserDetails): Promise<CoinBonusDto> {
        if (user.account.isDisableBonuses) {
            return null;
        }
        let bonuses = new Array();
        if (this.isNeedRegistrationBonus(user)) {
            bonuses.push(await this.getRegistrationBonus(user));
        }
        else if (this.isNeedDailyBonus(user)) {
            bonuses.push(await this.getDailyBonus(user, details));
        }
        if (!_.isEmpty(bonuses)) {
            await this.update(user);
        }
        return { nextDate: this.getBonusNextDate(user), bonuses }
    }

    public async update(userId: User | number, coinId: CoinId = CoinId.TOKEN): Promise<void> {
        if (!_.isNumber(userId)) {
            userId = userId.id;
        }
        return this.transport.sendListen(new CoinAccountUpdateCommand({ userId, coinId }));
    }
}