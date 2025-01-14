import { PassportModule } from '@nestjs/passport';
import { TransportModule } from '@ts-core/backend-nestjs';
import { DatabaseModule } from '@project/module/database';
import { JwtModule } from '@nestjs/jwt';
import { LoginService } from './service';
import { DynamicModule } from '@nestjs/common';
import { Logger } from '@ts-core/common';
import { JwtStrategy, IGoStrategySettings, GoStrategy, IJwtStrategySettings, VkStrategyInternal, IVkStrategySettings, VkStrategy, YaStrategy, IYaStrategySettings, MaStrategy, IMaStrategySettings, IVkStrategyInternalSettings, ITgStrategySettings, TgStrategy, TgStrategyInternal } from './strategy';
import { GuardModule } from '@project/module/guard';
import { InitController, LoginController, LogoutController } from './controller';
import { SharedModule } from '@project/module/shared';

export class LoginModule {
    // --------------------------------------------------------------------------
    //
    //  Public Static Methods
    //
    // --------------------------------------------------------------------------

    public static forRoot(settings: ILoginSettings): DynamicModule {
        return {
            module: LoginModule,
            global: true,
            imports: [
                GuardModule,
                SharedModule,

                DatabaseModule,
                TransportModule,
                JwtModule.register({ secret: settings.jwtSecret, signOptions: { expiresIn: settings.jwtExpiresTimeout } }),
                PassportModule.register({ defaultStrategy: 'jwt' })
            ],
            providers: [
                {
                    provide: JwtStrategy,
                    inject: [LoginService],
                    useFactory: (login) => new JwtStrategy(settings, login)
                },
                {
                    provide: GoStrategy,
                    inject: [Logger],
                    useFactory: (logger) => new GoStrategy(logger, settings)
                },
                {
                    provide: YaStrategy,
                    inject: [Logger],
                    useFactory: (logger) => new YaStrategy(logger, settings)
                },
                {
                    provide: MaStrategy,
                    inject: [Logger],
                    useFactory: (logger) => new MaStrategy(logger, settings)
                },
                {
                    provide: TgStrategy,
                    inject: [Logger],
                    useFactory: (logger) => new TgStrategy(logger, settings)
                },
                {
                    provide: TgStrategyInternal,
                    inject: [Logger],
                    useFactory: (logger) => new TgStrategyInternal(logger, settings)
                },
                {
                    provide: VkStrategy,
                    inject: [Logger],
                    useFactory: (logger) => new VkStrategy(logger, settings)
                },
                {
                    provide: VkStrategyInternal,
                    inject: [Logger],
                    useFactory: (logger) => new VkStrategyInternal(logger, settings)
                },
                LoginService
            ],
            controllers: [LoginController, LogoutController, InitController],
            exports: [LoginService, VkStrategyInternal]
        };
    }
}

export type ILoginSettings = IGoStrategySettings & IJwtStrategySettings & IVkStrategySettings & IVkStrategyInternalSettings & IYaStrategySettings & IMaStrategySettings & ITgStrategySettings;
