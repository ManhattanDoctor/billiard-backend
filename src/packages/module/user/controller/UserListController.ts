import { USER_URL } from '@project/common/user';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DefaultController } from '@ts-core/backend';
import { TypeormUtil } from '@ts-core/backend';
import { Logger } from '@ts-core/common';
import { IsOptional, Min, IsString } from 'class-validator';
import { DatabaseService } from '@project/module/database/service';
import { Swagger } from '@project/module/swagger';
import { Type } from 'class-transformer';
import { UserGuard, UserGuardOptions } from '@project/module/guard';
import { User, UserAccountType } from '@project/common/user';
import { UserEntity } from '@project/module/database/user';
import { Paginable } from '@ts-core/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TRANSFORM_ADMINISTRATOR } from '@project/module/core';
import { IUserListDto, IUserListDtoResponse } from '@project/common/api/user';
import * as _ from 'lodash';

// --------------------------------------------------------------------------
//
//  Dto
//
// --------------------------------------------------------------------------

export class UserListDto implements IUserListDto {
    @ApiPropertyOptional()
    @Type(() => Number)
    @Min(0)
    pageSize: number;

    @ApiPropertyOptional()
    @Type(() => Number)
    @Min(0)
    pageIndex: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    traceId?: string;
}

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

@Controller(USER_URL)
export class UserListController extends DefaultController<IUserListDto, IUserListDtoResponse> {
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

    @Swagger({ name: 'User list', response: null })
    @Get()
    @UseGuards(UserGuard)
    @UserGuardOptions({ account: UserAccountType.ADMINISTRATOR })
    public async execute(@Query({ transform: Paginable.transform }) params: IUserListDto): Promise<IUserListDtoResponse> {
        let query = UserEntity.createQueryBuilder('user');
        this.database.userRelationsAdd(query);

        TypeormUtil.applyFilterProperties(query, params.account, 'userAccount');
        TypeormUtil.applyFilterProperties(query, params.statistics, 'userStatistics');
        TypeormUtil.applyFilterProperties(query, params.preferences, 'userPreferences');

        return TypeormUtil.toPagination(query, params, this.transform);
    }

    protected transform = async (item: UserEntity): Promise<User> => item.toObject({ groups: TRANSFORM_ADMINISTRATOR });
}
