import { Controller, Query, Get, Req, UseGuards } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { INIT_URL } from '@project/common/api';
import { IInitDto, IInitDtoResponse } from '@project/common/api/login';
import { User } from '@project/common/user';
import { DefaultController } from '@ts-core/backend';
import { Logger, TransformUtil } from '@ts-core/common';
import { IsString, IsOptional, IsDefined } from 'class-validator';
import { Swagger } from '@project/module/swagger';
import { IUserHolder, UserEntity } from '@project/module/database/user';
import { UserGuard } from '@project/module/guard';
import { TransformGroup } from '@project/module/database';
import { CoinBonusDto } from '@project/common/api/coin';
import { CoinAccounts } from '@project/common/coin';
import { CoinService } from '@project/module/coin/service';
import { IUserDetails } from '@project/common/api/user';
import * as _ from 'lodash';

// --------------------------------------------------------------------------
//
//  Dto
//
// --------------------------------------------------------------------------

// --------------------------------------------------------------------------
//
//  Dto
//
// --------------------------------------------------------------------------

export class InitDto implements IInitDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsDefined()
    @Transform(item => JSON.parse(item.value))
    details?: IUserDetails;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    traceId?: string;
}


export class InitDtoResponse implements IInitDtoResponse {
    @ApiProperty()
    @IsDefined()
    public user: User;

    @ApiProperty()
    @IsDefined()
    public bonus: CoinBonusDto;

    @ApiProperty()
    @IsDefined()
    public balances: CoinAccounts;
}

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

@Controller(INIT_URL)
export class InitController extends DefaultController<IInitDto, IInitDtoResponse> {

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private coin: CoinService) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    @Swagger({ name: 'Get initialization details', response: InitDtoResponse })
    @Get()
    @UseGuards(UserGuard)
    public async executeExtended(@Query() params: InitDto, @Req() request: IUserHolder): Promise<InitDtoResponse> {
        let user = request.user;
        UserEntity.update({ id: user.id }, { lastLogin: new Date() });

        let bonus = await this.coin.getBonuses(user, params?.details);
        let balances = await this.coin.getAccounts(user.id);
        return { user: user.toObject({ groups: [TransformGroup.PRIVATE] }), balances, bonus }
    }
}
