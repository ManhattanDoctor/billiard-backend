import { ILogger } from '@ts-core/common';
import { UserResource } from '@project/common/user';
import { ILoginStrategy, LoginStrategy } from './LoginStrategy';
import { VkAuth } from '@ts-core/oauth';
import * as _ from 'lodash';

export class VkStrategy extends LoginStrategy<VkAuth> implements ILoginStrategy {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: ILogger, settings: IVkStrategySettings) {
        super(logger, UserResource.VK, settings.vkSiteSecret);
        this.oauth = new VkAuth(logger, settings.vkSiteId);
    }
}

export class IVkStrategySettings {
    readonly vkSiteId: string;
    readonly vkSiteSecret: string;
}
