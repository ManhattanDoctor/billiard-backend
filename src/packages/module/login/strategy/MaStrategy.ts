import * as _ from 'lodash';
import { ILogger } from '@ts-core/common';
import { MaAuth } from '@ts-core/oauth';
import { LoginStrategy } from './LoginStrategy';
import { UserResource } from '@project/common/user';

export class MaStrategy extends LoginStrategy<MaAuth> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: ILogger, settings: IMaStrategySettings) {
        super(logger, UserResource.MAIL, settings.maSiteSecret);
        this.oauth = new MaAuth(logger, settings.maSiteId);
    }
}

export class IMaStrategySettings {
    readonly maSiteId: string;
    readonly maSiteSecret: string;
}