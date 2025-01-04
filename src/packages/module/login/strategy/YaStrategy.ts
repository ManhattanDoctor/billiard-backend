import * as _ from 'lodash';
import { ILogger } from '@ts-core/common';
import { LoginStrategy } from './LoginStrategy';
import { UserResource } from '@project/common/user';
import { YaAuth } from '@ts-core/oauth';

export class YaStrategy extends LoginStrategy<YaAuth> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: ILogger, settings: IYaStrategySettings) {
        super(logger, UserResource.YANDEX, settings.yaSiteSecret);
        this.oauth = new YaAuth(logger, settings.yaSiteId);
    }
}

export class IYaStrategySettings {
    readonly yaSiteId: string;
    readonly yaSiteSecret: string;
}
