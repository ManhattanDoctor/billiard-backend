import * as _ from 'lodash';
import { ILogger } from '@ts-core/common';
import { LoginStrategy } from './LoginStrategy';
import { GoAuth } from '@ts-core/oauth';
import { UserResource } from '@project/common/user';

export class GoStrategy extends LoginStrategy<GoAuth> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: ILogger, settings: IGoStrategySettings) {
        super(logger, UserResource.GOOGLE, settings.goSiteSecret);
        this.oauth = new GoAuth(logger, settings.goSiteId);
    }

}

export class IGoStrategySettings {
    readonly goSiteId: string;
    readonly goSiteSecret: string;
}
