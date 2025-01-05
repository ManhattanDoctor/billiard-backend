import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DefaultController } from '@ts-core/backend-nestjs';
import { Logger } from '@ts-core/common';
import { IsOptional, IsNumber, IsString, IsEnum, IsNumberString } from 'class-validator';
import { Swagger } from '@project/module/swagger';
import { UserGuard, UserGuardOptions } from '@project/module/guard';
import { ICoinBalanceEditDto } from '@project/common/api/coin';
import { COIN_URL } from '@project/common/api';
import { UserAccountType } from '@project/common/user';
import { PaymentTransactionEntity } from '@project/module/database/payment';
import { PaymentTransactionType } from '@project/common/payment';
import { CoinId } from '@project/common/coin';
import { CoinService } from '@project/module/coin/service';
import * as _ from 'lodash';

// --------------------------------------------------------------------------
//
//  Dto
//
// --------------------------------------------------------------------------

export class CoinBalanceEditDto implements ICoinBalanceEditDto {
    @ApiPropertyOptional()
    @IsEnum(CoinId)
    coinId: CoinId;

    @ApiPropertyOptional()
    @IsNumberString()
    amount: string;

    @ApiPropertyOptional()
    @IsNumber()
    userId: number;

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

@Controller(`${COIN_URL}/balance`)
export class CoinBalanceEditController extends DefaultController<ICoinBalanceEditDto, void> {

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

    @Swagger({ name: 'Edit coin balance', response: null })
    @Post()
    @UseGuards(UserGuard)
    @UserGuardOptions({ account: UserAccountType.ADMINISTRATOR })
    public async executeExtended(@Body() params: CoinBalanceEditDto): Promise<void> {
        await PaymentTransactionEntity.saveEntity(params.userId, PaymentTransactionType.CORRECTION, params.coinId, params.amount);
        await this.service.update(params.userId, params.coinId);
    }
}
