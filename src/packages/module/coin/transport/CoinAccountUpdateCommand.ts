import { CoinId } from '@project/common/coin';
import { TransportCommandAsync } from '@ts-core/common';

export class CoinAccountUpdateCommand extends TransportCommandAsync<ICoinAccountUpdateDto, void> {
    // --------------------------------------------------------------------------
    //
    //  Static Properties
    //
    // --------------------------------------------------------------------------

    public static readonly NAME = 'CoinAccountUpdateCommand';

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(request: ICoinAccountUpdateDto) {
        super(CoinAccountUpdateCommand.NAME, request);
    }
}

export interface ICoinAccountUpdateDto {
    userId: number;
    coinId: CoinId;
}

