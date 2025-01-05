import { Controller, Query, Req, Get, UseGuards } from '@nestjs/common';
import { COIN_URL } from '@project/common/api';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Swagger } from '@project/module/swagger';
import { IUserHolder } from '@project/module/database/user';
import { UserGuard } from '@project/module/guard';
import { CoinStatusGetDtoResponse, ICoinStatusGetDto } from '@project/common/api/coin';
import { CoinService } from '../service';
import { IsOptional, IsDefined, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { Logger } from '@ts-core/common';
import { DefaultController } from '@ts-core/backend';
import { IUserDetails } from '@project/common/api/user';
import * as _ from 'lodash';

// --------------------------------------------------------------------------
//
//  Dto
//
// --------------------------------------------------------------------------

export class CoinStatusGetDto implements ICoinStatusGetDto {
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

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

@Controller(`${COIN_URL}/status`)
export class CoinStatusGetController extends DefaultController<ICoinStatusGetDto, CoinStatusGetDtoResponse> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private service: CoinService) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    @Swagger({ name: 'Get coin status', response: null })
    @Get()
    @UseGuards(UserGuard)
    public async executeExtended(@Query() params: CoinStatusGetDto, @Req() request: IUserHolder): Promise<CoinStatusGetDtoResponse> {
        let user = request.user;
        let bonus = await this.service.getBonuses(user, params?.details);
        let balances = await this.service.getAccounts(user.id);
        return { bonus, balances };
    }
}
