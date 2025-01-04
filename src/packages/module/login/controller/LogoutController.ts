import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { LOGOUT_URL } from '@project/common/api';
import { Swagger } from '@project/module/swagger';
import { DefaultController } from '@ts-core/backend';
import { Logger } from '@ts-core/common';
import { UserGuard, UserGuardOptions } from '@project/module/guard';
import { DatabaseService } from '@project/module/database/service';
import { IUserHolder } from '@project/module/database/user';
import * as _ from 'lodash';

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

@Controller(LOGOUT_URL)
export class LogoutController extends DefaultController<void, void> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private database: DatabaseService) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    @Swagger({ name: 'Logout user', response: null })
    @Post()
    @UseGuards(UserGuard)
    @UserGuardOptions({ required: false })
    public async executeExtended(@Req() request: IUserHolder): Promise<void> {
        if (_.isNil(request.user)) {
            return;
        }
        return this.database.userTokenRemove(UserGuard.getUserToken(request));
    }
}
