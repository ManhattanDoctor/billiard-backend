import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { LOGOUT_OTHERS_URL } from '@project/common/api';
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

@Controller(LOGOUT_OTHERS_URL)
export class LogoutOthersController extends DefaultController<void, void> {
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

    @Swagger({ name: 'Logout user except current', response: null })
    @Post()
    @UseGuards(UserGuard)
    public async executeExtended(@Req() request: IUserHolder): Promise<void> {
        return this.database.userTokensRemoveExcept(request.user, UserGuard.getUserToken(request));
    }
}
