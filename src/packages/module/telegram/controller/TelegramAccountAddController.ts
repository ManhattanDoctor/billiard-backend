import { Controller, Req, Body, Post, UseGuards, Inject } from '@nestjs/common';
import { TELEGRAM_URL } from '@project/common/api';
import { DefaultController } from '@ts-core/backend';
import { Logger } from '@ts-core/common';
import { Swagger } from '@project/module/swagger';
import { Type } from 'class-transformer';
import { UserGuard } from '@project/module/guard';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IUserHolder } from '@project/module/database/user';
import { IsDefined, IsOptional, IsString } from 'class-validator';
import { ITelegramAccountAddDto, ITelegramAccountAddDtoResponse } from '@project/common/api/telegram';
import { TgUser } from '@ts-core/oauth';
import { TelegramAccountSignatureInvalidError } from '@project/module/core/middleware';
import { TelegramAccountEntity } from '@project/module/database/telegram';
import { TelegramUtil } from '../util';
import * as _ from 'lodash';

// --------------------------------------------------------------------------
//
//  Dto
//
// --------------------------------------------------------------------------

export class TelegramAccountAddDto implements ITelegramAccountAddDto {
    @ApiProperty()
    @IsOptional()
    @IsDefined()
    @Type(() => TgUser)
    user: TgUser;

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

@Controller(`${TELEGRAM_URL}`)
export class TelegramAccountAddController extends DefaultController<ITelegramAccountAddDto, ITelegramAccountAddDtoResponse> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, @Inject('TELEGRAM_TOKEN') private token: string) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private async createAccountIfNeed(params: ITelegramAccountAddDto, userId: number): Promise<void> {
        let accountId = Number(params.user.id);
        let item = await TelegramAccountEntity.findOne({ where: { accountId } });
        if (_.isNil(item)) {
            await TelegramAccountEntity.createEntity(accountId, userId).save();
        }
        else if (item.userId !== userId) {
            await TelegramAccountEntity.update({ accountId }, { userId });
        }
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    @Swagger({ name: 'Telegram account add', response: null })
    @Post()
    @UseGuards(UserGuard)
    public async executeExtended(@Body() params: TelegramAccountAddDto, @Req() request: IUserHolder): Promise<ITelegramAccountAddDtoResponse> {
        if (!TelegramUtil.checkUserSignature(this.token, params.user)) {
            throw new TelegramAccountSignatureInvalidError();
        }
        let { user } = request;
        user.preferences.telegram = params.user.telegram;
        await user.save();

        await this.createAccountIfNeed(params, user.id);
        return { telegram: user.preferences.telegram };
    }
}
