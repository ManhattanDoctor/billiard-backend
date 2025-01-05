import { ErrorCode, IInsufficientFundsDto, IInvalidDto } from "@project/common/api";
import { UserAccountType, UserStatus } from "@project/common/user";
import { ExtendedError } from "@ts-core/common";
import { CoreExtendedError } from "./CoreExtendedError";

// --------------------------------------------------------------------------
//
//  Other
//
// --------------------------------------------------------------------------

export class RequestInvalidError<T> extends CoreExtendedError<IInvalidDto<T>> {
    constructor(details: IInvalidDto<T>, code: ErrorCode = ErrorCode.REQUEST_INVALID, status: number = ExtendedError.HTTP_CODE_BAD_REQUEST) {
        super(code, details, status);
    }
}

export class LocaleProjectNotFoundError extends CoreExtendedError<string> {
    constructor(details: string) {
        super(ErrorCode.LOCALE_PROJECT_NOT_FOUND, details, ExtendedError.HTTP_CODE_NOT_FOUND);
    }
}

export class InsufficientFundsError extends CoreExtendedError<IInsufficientFundsDto> {
    constructor(details: IInsufficientFundsDto) {
        super(ErrorCode.INSUFFICIENT_FUNDS, details, ExtendedError.HTTP_CODE_PAYMENT_REQUIRED);
    }
}

// --------------------------------------------------------------------------
//
//  Login
//
// --------------------------------------------------------------------------

export class LoginIdInvalidError extends CoreExtendedError<IInvalidDto<string | number>> {
    constructor(value: string | number) {
        super(ErrorCode.LOGIN_ID_INVALID, { name: 'id', value, expected: 'NOT_NULL' }, ExtendedError.HTTP_CODE_UNAUTHORIZED);
    }
}

export class LoginSignatureInvalidError extends CoreExtendedError<IInvalidDto<string>> {
    constructor(name: string, value: string) {
        super(ErrorCode.LOGIN_SIGNATURE_INVALID, { name, value }, ExtendedError.HTTP_CODE_UNAUTHORIZED);
    }
}

export class LoginTokenInvalidError extends CoreExtendedError<string> {
    constructor(details: string) {
        super(ErrorCode.LOGIN_TOKEN_INVALID, details, ExtendedError.HTTP_CODE_UNAUTHORIZED);
    }
}

export class LoginTokenExpiredError extends CoreExtendedError<IInvalidDto<number>> {
    constructor(value: number, expected: number) {
        super(ErrorCode.LOGIN_TOKEN_EXPIRED, { name: 'token', value, expected }, ExtendedError.HTTP_CODE_UNAUTHORIZED);
    }
}

// --------------------------------------------------------------------------
//
//  User
//
// --------------------------------------------------------------------------

export class UserUndefinedError extends CoreExtendedError {
    constructor() {
        super(ErrorCode.USER_UNDEFINED, null, ExtendedError.HTTP_CODE_UNAUTHORIZED);
    }
}
export class UserNotFoundError extends CoreExtendedError {
    constructor() {
        super(ErrorCode.USER_NOT_FOUND);
    }
}
export class UserForbiddenError extends CoreExtendedError {
    constructor() {
        super(ErrorCode.USER_FORBIDDEN);
    }
}
export class UserTokenInvalidError extends CoreExtendedError<string> {
    constructor(details: string) {
        super(ErrorCode.USER_TOKEN_INVALID, details, ExtendedError.HTTP_CODE_UNAUTHORIZED);
    }
}
export class UserTokenExpiredError extends CoreExtendedError<IInvalidDto<number>> {
    constructor(value: number, expected: number) {
        super(ErrorCode.USER_TOKEN_EXPIRED, { name: 'token', value, expected }, ExtendedError.HTTP_CODE_UNAUTHORIZED);
    }
}
export class UserStatusInvalidError extends CoreExtendedError<IInvalidDto<UserStatus>> {
    constructor(details: IInvalidDto<UserStatus>) {
        super(ErrorCode.USER_STATUS_INVALID, details, ExtendedError.HTTP_CODE_UNAUTHORIZED);
    }
}
export class UserAccountInvalidError extends CoreExtendedError<IInvalidDto<UserAccountType>> {
    constructor(value: UserAccountType, expected: UserAccountType | Array<UserAccountType>) {
        super(ErrorCode.USER_ACCOUNT_INVALID, { name: 'account.type', value, expected });
    }
}

// --------------------------------------------------------------------------
//
//  Comment
//
// --------------------------------------------------------------------------

export class CommentDisabledError extends CoreExtendedError {
    constructor() {
        super(ErrorCode.COMMENT_DISABLED);
    }
}
export class CommentNotFoundError extends CoreExtendedError {
    constructor() {
        super(ErrorCode.COMMENT_NOT_FOUND);
    }
}
export class CommentForbiddenError extends CoreExtendedError {
    constructor() {
        super(ErrorCode.COMMENT_FORBIDDEN);
    }
}


// --------------------------------------------------------------------------
//
//  Telegram
//
// --------------------------------------------------------------------------

export class TelegramAccountNotFoundError extends CoreExtendedError {
    constructor() {
        super(ErrorCode.TELEGRAM_ACCOUNT_NOT_FOUND);
    }
}
export class TelegramAccountSignatureInvalidError extends CoreExtendedError {
    constructor() {
        super(ErrorCode.TELEGRAM_ACCOUNT_SIGNATURE_INVALID);
    }
}