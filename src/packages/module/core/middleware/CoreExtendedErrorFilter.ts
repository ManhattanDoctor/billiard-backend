import { ArgumentsHost, Catch } from '@nestjs/common';
import { ExtendedErrorFilter, IExceptionFilter } from '@ts-core/backend-nestjs';
import { ExtendedError } from '@ts-core/common';
import { CoreExtendedError } from './CoreExtendedError';
import * as _ from 'lodash';

@Catch(CoreExtendedError)
export class CoreExtendedErrorFilter implements IExceptionFilter<CoreExtendedError> {
    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public instanceOf(item: any): item is CoreExtendedError {
        return CoreExtendedError.instanceOf(item);
    }

    public catch(error: CoreExtendedError, host: ArgumentsHost): any {
        let status = !_.isNil(error.status) ? error.status : ExtendedError.HTTP_CODE_BAD_REQUEST;
        return ExtendedErrorFilter.catch(error, host, status);
    }
}
