import { Body, Controller, Param, ParseIntPipe, Put, Req, UseGuards } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DefaultController } from '@ts-core/backend';
import { Logger, ObjectUtil } from '@ts-core/common';
import { IsDefined, IsEnum, IsOptional, IsString } from 'class-validator';
import { Swagger } from '@project/module/swagger';
import { UserGuard } from '@project/module/guard';
import { IUserHolder, UserEntity } from '@project/module/database/user';
import { DatabaseService } from '@project/module/database/service';
import { IUserEditDto, IUserEditDtoResponse } from '@project/common/api/user';
import { User, UserAccount, UserPreferences, UserStatus } from '@project/common/user';
import { UserForbiddenError } from '@project/module/core/middleware';
import { USER_URL } from '@project/common/user';
import { TRANSFORM_PRIVATE } from '@project/module/core';
import { PermissionUtil } from '@project/common/util';
import * as _ from 'lodash';

// --------------------------------------------------------------------------
//
//  Dto
//
// --------------------------------------------------------------------------

export class UserEditDto implements IUserEditDto {
    @ApiPropertyOptional()
    @IsOptional()
    id?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsEnum(UserStatus)
    status?: UserStatus;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDefined()
    account?: Partial<UserAccount>;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDefined()
    preferences?: Partial<UserPreferences>;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    traceId?: string;
}

@Controller(`${USER_URL}/:id`)
export class UserEditController extends DefaultController<IUserEditDto, IUserEditDtoResponse> {
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

    @Swagger({ name: 'User edit', response: User })
    @Put()
    @UseGuards(UserGuard)
    public async executeExtended(@Param('id', ParseIntPipe) userId: number, @Body() params: UserEditDto, @Req() request: IUserHolder): Promise<IUserEditDtoResponse> {
        let { user } = request;
        let { preferences } = params;
        let item = await this.database.userGet(userId, true);

        if (!PermissionUtil.userIsCanEdit(item, user, params)) {
            throw new UserForbiddenError();
        }

        let status = !PermissionUtil.userIsAdministrator(user) ? [UserStatus.ACTIVE] : null;
        UserGuard.checkUser({ isRequired: true, status }, item);

        if (PermissionUtil.userIsAdministrator(user)) {
            if (!_.isNil(params.status)) {
                item.status = params.status;
            }
            if (!_.isNil(params.account?.type)) {
                item.account.type = params.account.type;
            }
        }

        if (!_.isNil(preferences?.birthday)) {
            preferences.birthday = new Date(preferences.birthday);
        }
        ObjectUtil.copyPartial(preferences, item.preferences);

        await UserEntity.save(item);
        return item.toObject({ groups: TRANSFORM_PRIVATE });
    }
}
