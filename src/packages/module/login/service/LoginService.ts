import { Injectable } from '@nestjs/common';
import { UnreachableStatementError } from '@ts-core/common';
import { Logger, LoggerWrapper } from '@ts-core/common';
import { JwtService } from '@nestjs/jwt';
import { ILoginDto, ILoginDtoResponse, LoginResource } from '@project/common/api/login';
import { UserEntity } from '@project/module/database/user';
import { GoStrategy, MaStrategy, ILoginStrategy, VkStrategyInternal, VkStrategy, YaStrategy, TgStrategy, TgStrategyInternal, ILoginStrategyProfile, IJwtUser } from '../strategy';
import { UserResource, UserStatus, USER_PREFERENCES_NAME_MIN_LENGTH, USER_PREFERENCES_NICKNAME_MIN_LENGTH, USER_PREFERENCES_NICKNAME_MAX_LENGTH } from '@project/common/user';
import { DatabaseService } from '@project/module/database/service';
import { RandomUtil } from '@ts-core/common';
import { UserGuard } from '@project/module/guard';
import { LoginIdInvalidError } from '@project/module/core/middleware';
import { LoginUtil } from '@project/common/login';
import * as _ from 'lodash';

@Injectable()
export class LoginService extends LoggerWrapper {
    // --------------------------------------------------------------------------
    //
    //  Public Static Methods
    //
    // --------------------------------------------------------------------------

    public static createLogin(id: string | number, resource: UserResource): string {
        let item = LoginUtil.createLogin(id, resource)
        if (_.isNil(item)) {
            throw new LoginIdInvalidError(id);
        }
        return item;
    }

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger,
        private database: DatabaseService,
        private jwt: JwtService,
        private go: GoStrategy,
        private ya: YaStrategy,
        private vk: VkStrategy,
        private tg: TgStrategy,
        private ma: MaStrategy,
        private vkInternal: VkStrategyInternal,
        private tgInternal: TgStrategyInternal) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private async add(params: ILoginDto, profile: ILoginStrategyProfile, strategy: ILoginStrategy): Promise<UserEntity> {
        let item = await strategy.createUser(profile);
        item.preferences.name = this.getName(item);
        item.preferences.nickname = this.getNickname(item);
        await item.save();

        await strategy.userAdded(params, item);
        return item;
    }

    private getName(user: UserEntity): string {
        let { name } = user.preferences;
        if (_.isEmpty(name)) {
            return RandomUtil.randomString(USER_PREFERENCES_NAME_MIN_LENGTH);
        }
        if (name.length < USER_PREFERENCES_NAME_MIN_LENGTH) {
            return `${name}${RandomUtil.randomString(USER_PREFERENCES_NAME_MIN_LENGTH - name.length)}`;
        }
        return name;
    }

    private getNickname(user: UserEntity): string {
        let { nickname } = user.preferences;
        return !_.isEmpty(nickname) ? nickname : `user_${user.id}`;
    }

    private getStrategy(resource: LoginResource): ILoginStrategy {
        switch (resource) {
            case LoginResource.GOOGLE:
                return this.go;
            case LoginResource.YANDEX:
                return this.ya;
            case LoginResource.MAIL:
                return this.ma;
            case LoginResource.TELEGRAM:
                return this.tg;
            case LoginResource.VK:
                return this.vk;
            case LoginResource.VK_INTERNAL:
                return this.vkInternal;
            case LoginResource.TELEGRAM_INTERNAL:
                return this.tgInternal;
            default:
                throw new UnreachableStatementError(resource);
        }
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async login(params: ILoginDto): Promise<ILoginDtoResponse> {
        let strategy = this.getStrategy(params.resource);
        let profile = await strategy.getProfile(params);

        let user = await this.database.userGet(profile.login, false);
        if (_.isNil(user)) {
            user = await this.add(params, profile, strategy);
        }

        UserGuard.checkUser({ isRequired: true, status: [UserStatus.ACTIVE] }, user);

        let item: IJwtUser = { id: user.id, login: user.login };
        return { sid: this.jwt.sign(item) };
    }

    public async userGet(item: IJwtUser): Promise<UserEntity> {
        let user = await this.database.userGet(item.id, true);
        UserGuard.checkUser({ isRequired: true, status: [UserStatus.ACTIVE] }, user);
        return Promise.resolve(user);
    }

    public jwtUserGet(item: string): IJwtUser {
        return this.jwt.verify<IJwtUser>(item);
    }
}

