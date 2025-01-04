import { Controller, Req, Delete, UseGuards } from '@nestjs/common';
import { TELEGRAM_URL } from '@project/common/api';
import { DefaultController } from '@ts-core/backend';
import { Logger } from '@ts-core/common';
import { Swagger } from '@project/module/swagger';
import { UserGuard } from '@project/module/guard';
import { IUserHolder } from '@project/module/database/user';
import { ITelegramAccountRemoveDtoResponse } from '@project/common/api/telegram';
import { TelegramAccountEntity } from '@project/module/database/telegram';
import * as _ from 'lodash';

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

@Controller(`${TELEGRAM_URL}`)
export class TelegramAccountRemoveController extends DefaultController<void, ITelegramAccountRemoveDtoResponse> {
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
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    @Swagger({ name: 'Telegram account remove', response: null })
    @Delete()
    @UseGuards(UserGuard)
    public async executeExtends(@Req() request: IUserHolder): Promise<ITelegramAccountRemoveDtoResponse> {
        await TelegramAccountEntity.update({ userId: request.user.id }, { userId: null });
        return { telegram: null };
    }
}
