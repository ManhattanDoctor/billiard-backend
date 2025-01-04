import { ILogger, TransformUtil } from '@ts-core/common';
import { ILoginStrategyProfile, LoginStrategy } from './LoginStrategy';
import { UserResource } from '@project/common/user';
import { ILoginDto } from '@project/common/api/login';
import { CoreExtendedError, LoginSignatureInvalidError, LoginTokenInvalidError, RequestInvalidError } from '@project/module/core/middleware';
import { LoginUser } from '@project/common/login';
import { TgUser } from '@ts-core/oauth';
import { ErrorCode } from '@project/common/api';
import { TelegramUtil } from '@project/module/telegram/util';
import { LoginService } from '../service';
import { UserEntity } from '@project/module/database/user';
import { TelegramAccountEntity } from '@project/module/database/telegram';
import * as _ from 'lodash';

export class TgStrategy extends LoginStrategy {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: ILogger, settings: ITgStrategySettings) {
        super(logger, UserResource.TELEGRAM, settings.telegramToken);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private checkSignature(data: ILoginDto): TgUser {
        let item = TransformUtil.toClass(TgUser, data.data);
        if (_.isNil(item)) {
            throw new RequestInvalidError({ name: 'data', value: null, expected: 'NOT_NULL' }, ErrorCode.REQUEST_INVALID, CoreExtendedError.HTTP_CODE_UNAUTHORIZED);
        }
        if (!TelegramUtil.checkUserSignature(this.secret, item)) {
            throw new LoginSignatureInvalidError('sign', item.toCheckString());
        }
        return item;
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async getProfile(data: ILoginDto): Promise<ILoginStrategyProfile> {
        try {
            let item = this.checkSignature(data);
            let profile = new LoginUser(item);
            return { login: LoginService.createLogin(profile.id, this.resource), profile }
        }
        catch (error) {
            throw new LoginTokenInvalidError(error.message);
        }
    }

    public async userAdded(data: ILoginDto, user: UserEntity): Promise<void> {
        await super.userAdded(data, user);
        let item = this.checkSignature(data);
        try {
            await TelegramAccountEntity.update({ accountId: Number(item.id) }, { userId: user.id });
        }
        catch (error) {
            this.error(`Error during user added: ${error.message}`)
        }
    }
}

export class ITgStrategySettings {
    readonly telegramToken: string;
}
