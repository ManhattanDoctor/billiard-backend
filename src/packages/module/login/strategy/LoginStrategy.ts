import { ILoginDto } from "@project/common/api/login";
import { LoginUser } from "@project/common/login";
import { UserResource, UserStatus } from "@project/common/user";
import { LoginTokenInvalidError } from "@project/module/core/middleware";
import { UserAccountEntity, UserEntity, UserPreferencesEntity } from "@project/module/database/user";
import { LoggerWrapper, ILogger } from "@ts-core/common";
import { IOAuthDto, OAuthBase } from "@ts-core/oauth";
import { LoginService } from "../service";

export abstract class LoginStrategy<T extends OAuthBase = OAuthBase> extends LoggerWrapper implements ILoginStrategy {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    protected oauth: T;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: ILogger, protected resource: UserResource, protected secret: string) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private async getOAuthUser(token: string): Promise<LoginUser> {
        let profile = await this.oauth.getProfile(token);
        return new LoginUser(profile);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async getProfile(data: ILoginDto): Promise<ILoginStrategyProfile> {
        try {
            let token = await this.oauth.getTokenByCode(data.data as IOAuthDto, this.secret);
            let profile = await this.getOAuthUser(token.accessToken);
            return { login: LoginService.createLogin(profile.id, this.resource), profile }
        }
        catch (error) {
            throw new LoginTokenInvalidError(error.message);
        }
    }

    public async createUser(data: ILoginStrategyProfile): Promise<UserEntity> {
        let item = new UserEntity();
        item.login = data.login;
        item.status = UserStatus.ACTIVE;
        item.resource = this.resource;

        item.account = UserAccountEntity.createEntity();
        item.preferences = UserPreferencesEntity.createEntity(data.profile.preferences);
        return item;
    }

    public async userAdded(data: ILoginDto, user: UserEntity): Promise<void> { }
}

export interface ILoginStrategy {
    userAdded(data: ILoginDto, user: UserEntity): Promise<void>;
    getProfile(data: ILoginDto): Promise<ILoginStrategyProfile>;
    createUser(data: ILoginStrategyProfile): Promise<UserEntity>;
}

export interface ILoginStrategyProfile {
    login: string;
    profile: LoginUser;
}