import { Controller, Get, Param, ParseIntPipe, Req, UseGuards } from '@nestjs/common';
import { DefaultController } from '@ts-core/backend-nestjs';
import { Logger } from '@ts-core/common';
import { DatabaseService } from '@project/module/database/service';
import { User } from '@project/common/user';
import { Swagger } from '@project/module/swagger';
import { UserGuard } from '@project/module/guard';
import { IUserHolder } from '@project/module/database/user';
import { IUserGetDtoResponse } from '@project/common/api/user';
import { USER_URL } from '@project/common/user';
import { TRANSFORM_ADMINISTRATOR, TRANSFORM_PRIVATE, TRANSFORM_PUBLIC } from '@project/module/core';
import { PermissionUtil } from '@project/common/util';

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

@Controller(`${USER_URL}/:id`)
export class UserGetController extends DefaultController<number, IUserGetDtoResponse> {
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

    @Swagger({ name: `Get user by id`, response: User })
    @Get()
    @UseGuards(UserGuard)
    public async executeExtends(@Param('id', ParseIntPipe) id: number, @Req() request: IUserHolder): Promise<IUserGetDtoResponse> {
        let user = request.user;

        let item = await this.database.userGet(id, true);
        UserGuard.checkUser({ isRequired: true }, item);

        let groups = PermissionUtil.userIsUser(item, user) ? TRANSFORM_PRIVATE : TRANSFORM_PUBLIC;
        if (PermissionUtil.userIsAdministrator(user)) {
            groups = TRANSFORM_ADMINISTRATOR;
        }
        return item.toObject({ groups });
    }
}
