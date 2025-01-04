import { createHmac, createHash } from 'node:crypto';
import { TgUser } from '@ts-core/oauth';
import * as _ from 'lodash';

export class TelegramUtil {
    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    public static checkUserSignature(token: string, user: TgUser): boolean {
        if (_.isEmpty(user)) {
            return false;
        }
        let secret = createHash('sha256').update(token.trim()).digest();
        let hmac = createHmac('sha256', secret).update(TgUser.toCheckString(user)).digest('hex');
        return hmac === user.hash;
    }
}