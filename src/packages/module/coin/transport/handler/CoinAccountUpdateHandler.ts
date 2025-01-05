import { Injectable } from '@nestjs/common';
import { Logger } from '@ts-core/common';
import { Transport, TransportCommandHandler } from '@ts-core/common';
import { CoinAccountUpdateCommand, ICoinAccountUpdateDto } from '../CoinAccountUpdateCommand';
import { DatabaseService } from '@project/module/database/service';
import { CoinAccountEntity } from '@project/module/database/coin';
import * as _ from 'lodash';

@Injectable()
export class CoinAccountUpdateHandler extends TransportCommandHandler<ICoinAccountUpdateDto, CoinAccountUpdateCommand> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, transport: Transport, private database: DatabaseService) {
        super(logger, transport, CoinAccountUpdateCommand.NAME);
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected async execute(params: ICoinAccountUpdateDto): Promise<void> {
        let item = await CoinAccountEntity.findOne({ where: params });
        if (_.isNil(item)) {
            item = CoinAccountEntity.createEntity(params.userId, params.coinId);
        }
        item.amount = await this.database.getCoinAmount(params.userId, params.coinId);
        await item.save();
    }
}