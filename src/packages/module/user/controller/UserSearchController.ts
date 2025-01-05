import { Controller, Get, Param } from '@nestjs/common';
import { DefaultController } from '@ts-core/backend-nestjs';
import { Logger } from '@ts-core/common';
import { USER_SEARCH_URL } from '@project/common/api';
import { User } from '@project/common/user';
import { IUserSearchDtoResponse } from '@project/common/api/user';
import { TRANSFORM_PUBLIC } from '@project/module/core';
import { UserEntity } from '@project/module/database/user';
import * as _ from 'lodash';

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

@Controller(`${USER_SEARCH_URL}`)
export class UserSearchController extends DefaultController<string, IUserSearchDtoResponse> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private async search(value?: string): Promise<Array<User>> {
        let query = UserEntity.createQueryBuilder('user');
        query.leftJoinAndSelect('user.preferences', 'userPreferences');
        query.limit(5);

        if (!_.isEmpty(value)) {
            let condition = { value: `%${value.toLowerCase()}%` };
            query.orWhere('LOWER(userPreferences.name) like :value', condition);
            query.orWhere('LOWER(userPreferences.nickname) like :value', condition);
        }

        let items = await query.getMany();
        return items.map(item => item.toObject({ groups: TRANSFORM_PUBLIC }));
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    @Get(':value')
    public async execute(@Param('value') value: string): Promise<IUserSearchDtoResponse> {
        return this.search(value);
    }
    @Get()
    public async executeExtended(): Promise<IUserSearchDtoResponse> {
        return this.search();
    }
}
