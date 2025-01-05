import { Controller, Req, Param, Get, UseGuards } from '@nestjs/common';
import { COIN_URL } from '@project/common/api';
import { UserAccountType } from '@project/common/user';
import { DefaultController } from '@ts-core/backend';
import { Logger } from '@ts-core/common';
import { isNumberString } from 'class-validator';
import { Swagger } from '@project/module/swagger';
import { DatabaseService } from '@project/module/database/service';
import { UserUID } from '@project/common/api/user';
import { IUserHolder } from '@project/module/database/user';
import { UserAccountInvalidError, UserNotFoundError } from '@project/module/core/middleware';
import { UserGuard } from '@project/module/guard';
import { PermissionUtil } from '@project/common/util';
import { ICoinAccountsGetDto } from '@project/common/api/coin';
import { CoinService } from '../service';
import * as _ from 'lodash';

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

@Controller(`${COIN_URL}/:id/accounts`)
export class CoinAccountsGetController extends DefaultController<UserUID, ICoinAccountsGetDto> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private database: DatabaseService, private service: CoinService) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    @Swagger({ name: 'Get coin accounts', response: null })
    @Get()
    @UseGuards(UserGuard)
    public async executeExtended(@Param('id') userId: UserUID, @Req() request: IUserHolder): Promise<ICoinAccountsGetDto> {
        if (isNumberString(userId)) {
            userId = Number(userId);
        }

        let item = await this.database.userGet(userId, false);
        if (_.isNil(item)) {
            throw new UserNotFoundError();
        }
        let user = request.user;
        if (!PermissionUtil.userIsCanCoinAccountsGet(item, user)) {
            throw new UserAccountInvalidError(user.account.type, UserAccountType.ADMINISTRATOR);
        }
        return this.service.getAccounts(userId);
    }
}
