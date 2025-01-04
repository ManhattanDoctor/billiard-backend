import { ExecutionContext, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { ExtractJwt } from 'passport-jwt';
import { DatabaseService } from '@project/module/database/service';
import { PromiseHandler } from '@ts-core/common';
import { IUserHolder, UserEntity } from '@project/module/database/user';
import { UserAccountType, UserStatus } from '@project/common/user';
import { UserAccountInvalidError, UserStatusInvalidError, UserUndefinedError } from '@project/module/core/middleware';
import { LoginService } from '@project/module/login/service';
import * as _ from 'lodash';

@Injectable()
export class UserGuard extends AuthGuard('jwt') {
    // --------------------------------------------------------------------------
    //
    //  Constants
    //
    // --------------------------------------------------------------------------

    public static OPTIONS: string = 'options';

    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    public static checkUser(options: IGuardOptions, user: UserEntity): void {
        if (!options.isRequired) {
            return;
        }
        if (_.isNil(user)) {
            throw new UserUndefinedError();
        }
        if (!_.isEmpty(options.status) && !options.status.includes(user.status)) {
            throw new UserStatusInvalidError({ value: user.status, expected: options.status });
        }
        if (!_.isEmpty(options.account) && !options.account.includes(user.account.type)) {
            throw new UserAccountInvalidError(user.account.type, options.account);
        }
    }

    public static getUserToken(request: IUserHolder): string {
        return !_.isNil(request) ? LoginService.hashToken(ExtractJwt.fromAuthHeaderAsBearerToken()(request)) : null;
    }

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(private reflector: Reflector, private database: DatabaseService) {
        super();
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private getOptions(options: IUserGuardOptions): IGuardOptions {
        if (_.isNil(options)) {
            return { isRequired: true };
        }
        let item = { isRequired: !_.isNil(options.required) ? options.required : true } as IGuardOptions;
        if (!_.isNil(options.account)) {
            item.account = !_.isArray(options.account) ? [options.account] : options.account;
        }
        return item;
    }

    private async checkOptions(options: IGuardOptions, user: UserEntity): Promise<void> {
        UserGuard.checkUser(options, user);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async canActivate(context: ExecutionContext): Promise<boolean> {
        let options = this.getOptions(this.reflector.get<IUserGuardOptions>(UserGuard.OPTIONS, context.getHandler()));
        let request = context.switchToHttp().getRequest() as IUserHolder;
        let token = UserGuard.getUserToken(request);
        try {
            await PromiseHandler.toPromise(super.canActivate(context));
        }
        catch (error) {
            await this.database.userTokenRemove(token);
            if (!options.isRequired) {
                return true;
            }
            throw error;
        }
        /*
        if (options.isRequired && !(await this.database.userTokenHas(token))) {
            throw new UnauthorizedException();
        }
        */
        await this.checkOptions(options, request.user);
        return true;
    }
}

export interface IGuardOptions {
    account?: Array<UserAccountType>;
    status?: Array<UserStatus>,
    isRequired: boolean;
}

export interface IUserGuardOptions {
    account?: UserAccountType | Array<UserAccountType>;
    required?: boolean;
}

export const UserGuardOptions = (item: IUserGuardOptions) => SetMetadata(UserGuard.OPTIONS, item);
