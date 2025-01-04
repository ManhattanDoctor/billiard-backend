
import { ErrorCode } from '@project/common/api';
import { ExtendedError } from '@ts-core/common';
import * as _ from 'lodash';

export class CoreExtendedError<T = void> extends ExtendedError<T, ErrorCode> {

    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    public static instanceOf(item: any): item is ExtendedError {
        return item instanceof CoreExtendedError || Object.values(ErrorCode).includes(item.code);
    }
    
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(code: ErrorCode, details?: T, public status?: number) {
        super('', code, details);
        this.message = this.constructor.name;
    }
}
