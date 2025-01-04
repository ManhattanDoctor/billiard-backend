import { TransformUtil } from '@ts-core/common';
import { ExtendedError, Logger } from '@ts-core/common';
import { ILoginDto } from '@project/common/api/login';
import { LoginTokenInvalidError, RequestInvalidError } from '@project/module/core/middleware';
import { LoginUser } from '@project/common/login';
import { ILoginStrategyProfile, LoginStrategy } from './LoginStrategy';
import { LoginSignatureInvalidError } from '@project/module/core/middleware';
import { ErrorCode } from '@project/common/api';
import { UserResource } from '@project/common/user';
import { TgUser } from '@ts-core/oauth';
import { LoginService } from '../service';
import { ITgStrategySettings } from './TgStrategy';
import { createHmac } from 'node:crypto';
import { UserEntity } from '@project/module/database/user';
import { TelegramAccountEntity } from '@project/module/database/telegram';
import * as _ from 'lodash';

export class TgStrategyInternal extends LoginStrategy {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, settings: ITgStrategySettings) {
        super(logger, UserResource.TELEGRAM, settings.telegramToken);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private checkSignature(data: ILoginDto): TgUser {
        let item = TransformUtil.toClass(TgUser, data.data);
        let raw = item.raw;
        if (_.isNil(raw)) {
            throw new RequestInvalidError({ name: 'raw', value: null, expected: 'NOT_NULL' }, ErrorCode.REQUEST_INVALID, ExtendedError.HTTP_CODE_UNAUTHORIZED);
        }

        let secret = createHmac('sha256', 'WebAppData').update(this.secret).digest();
        let params = Object.fromEntries(new URLSearchParams(raw));
        let hmac = createHmac('sha256', secret).update(TgUser.toCheckString(params)).digest('hex')

        if (hmac !== params.hash) {
            throw new LoginSignatureInvalidError('sign', hmac);
        }
        item.parse(JSON.parse(params.user));
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

export class ITgStrategyInternalSettings extends ITgStrategySettings { }
