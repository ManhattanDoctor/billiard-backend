import { createHash } from 'crypto';

export class HashUtil {
    // --------------------------------------------------------------------------
    //
    // 	Static Methods
    //
    // --------------------------------------------------------------------------

    public static md5(value: number | string): string {
        return createHash('md5').update(value.toString()).digest('hex');
    }

    public static sha256(value: number | string): string {
        return createHash('sha256').update(value.toString()).digest('hex');
    }
}