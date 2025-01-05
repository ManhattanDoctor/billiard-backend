import { Injectable } from '@nestjs/common';
import { Transport, Logger, LoggerWrapper } from '@ts-core/common';
import { UserEntity } from '@project/module/database/user';
import { DatabaseService } from '@project/module/database/service';
import { UserGuard } from '@project/module/guard';
import { LoginUser } from '@project/module/login/service';
import { UserStatus } from '@project/common/user';
import * as _ from 'lodash';

@Injectable()
export class UserService extends LoggerWrapper {

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private transport: Transport, private database: DatabaseService) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async validate(payload: LoginUser): Promise<UserEntity> {
        let user = await this.database.userGet(payload.id, true);
        UserGuard.checkUser({ isRequired: true, status: [UserStatus.ACTIVE] }, user);
        return Promise.resolve(user);
    }
}