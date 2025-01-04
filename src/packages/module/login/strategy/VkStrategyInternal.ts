import { TransformUtil } from '@ts-core/common';
import { ExtendedError, Logger } from '@ts-core/common';
import * as _ from 'lodash';
import { ILoginDto } from '@project/common/api/login';
import { createHmac } from 'crypto';
import { LoginTokenInvalidError, RequestInvalidError } from '@project/module/core/middleware';
import { LoginUser } from '@project/common/login';
import { ILoginStrategyProfile, LoginStrategy } from './LoginStrategy';
import { LoginSignatureInvalidError } from '@project/module/core/middleware';
import { ErrorCode } from '@project/common/api';
import { UserResource } from '@project/common/user';
import { VkUser } from '@ts-core/oauth';
import { LoginService } from '../service';

export class VkStrategyInternal extends LoginStrategy {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, settings: IVkStrategyInternalSettings) {
        super(logger, UserResource.VK, settings.vkInternalSecret);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public checkSignature(item: string): URLSearchParams {
        if (_.isNil(item)) {
            throw new RequestInvalidError({ name: 'user.params', value: null, expected: 'NOT_NULL' }, ErrorCode.REQUEST_INVALID, ExtendedError.HTTP_CODE_UNAUTHORIZED);
        }

        let params = new URLSearchParams(item);
        let signature = params.get('sign');
        if (_.isNil(signature)) {
            throw new RequestInvalidError({ name: 'user.params.sign', value: signature, expected: 'NOT_NULL' }, ErrorCode.REQUEST_INVALID, ExtendedError.HTTP_CODE_UNAUTHORIZED);
        }

        let keys = Array.from(params.keys()).sort();
        let ordered = new URLSearchParams();
        for (let key of keys) {
            if (key.slice(0, 3) === 'vk_') {
                ordered.set(key, params.get(key));
            }
        }

        let hash = createHmac('sha256', this.secret).update(ordered.toString()).digest().toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=$/, '');
        if (hash !== signature) {
            throw new LoginSignatureInvalidError('sign', signature);
        }
        return params;
    }
    
    public async getProfile(data: ILoginDto): Promise<ILoginStrategyProfile> {
        try {
            let item = TransformUtil.toClass(VkUser, data.data);
            let params = this.checkSignature(item.params);

            let profile = new LoginUser(item);
            profile.id = params.get('vk_user_id');
            return { login: LoginService.createLogin(profile.id, this.resource), profile }
        }
        catch (error) {
            throw new LoginTokenInvalidError(error.message);
        }
    }
}

export class IVkStrategyInternalSettings {
    readonly vkInternalSecret: string;
}
