import { DynamicModule, Inject, OnApplicationBootstrap } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { LoggerModule, TransportModule, TransportType, CacheModule } from '@ts-core/backend-nestjs';
import { IDatabaseSettings, ModeApplication } from '@ts-core/backend';
import { AppSettings } from './AppSettings';
import { UserModule } from '@project/module/user';
import { LoginModule } from '@project/module/login';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { DatabaseModule } from '@project/module/database';
import { Logger } from '@ts-core/common';
import { modulePath } from '@project/module';
import { CommentModule } from '@project/module/comment';
import { OAuthModule } from '@project/module/oauth';
import { THROTTLE_LIMIT_DEFAULT, THROTTLE_TTL_DEFAULT } from '@project/module/guard';
import { InitializeService } from './service';
import { LanguageModule } from '@project/module/language';
import { TelegramModule } from '@project/module/telegram';
import { CoinModule } from '@project/module/coin';
import { SocketModule } from '@project/module/socket';

export class AppModule extends ModeApplication implements OnApplicationBootstrap {
    // --------------------------------------------------------------------------
    //
    //  Public Static Methods
    //
    // --------------------------------------------------------------------------

    public static forRoot(settings: AppSettings): DynamicModule {
        return {
            module: AppModule,
            imports: [
                CacheModule.forRoot(),
                LoggerModule.forRoot(settings),
                TypeOrmModule.forRoot(AppModule.getOrmConfig(settings)[0]),
                TransportModule.forRoot({ type: TransportType.LOCAL }),

                ThrottlerModule.forRoot([{ ttl: THROTTLE_TTL_DEFAULT, limit: THROTTLE_LIMIT_DEFAULT }]),

                UserModule,
                CoinModule,
                OAuthModule,
                SocketModule,
                CommentModule,
                DatabaseModule,

                LanguageModule.forRoot(`/Users/renat.gubaev/Work/JS/billiard/billiard-backend/locale`),
                // LanguageModule.forRoot(`${process.cwd()}/locale`),
                LoginModule.forRoot(settings),
                TelegramModule.forRoot(settings.telegramToken)
            ],
            providers: [
                InitializeService,
                {
                    provide: AppSettings,
                    useValue: settings
                },
                {
                    provide: APP_GUARD,
                    useClass: ThrottlerGuard
                }
            ]
        };
    }

    public static getOrmConfig(settings: IDatabaseSettings): Array<TypeOrmModuleOptions> {
        let entities = [`${modulePath()}/database/**/*Entity.{ts,js}`];
        return [
            {
                type: 'postgres',
                host: settings.databaseHost,
                port: settings.databasePort,
                username: settings.databaseUserName,
                password: settings.databaseUserPassword,
                database: settings.databaseName,
                synchronize: false,
                logging: false,
                migrations: [__dirname + '/migration/*.{ts,js}'],
                migrationsRun: true,
                entities,
            },
            {
                name: 'seed',
                type: 'postgres',
                host: settings.databaseHost,
                port: settings.databasePort,
                username: settings.databaseUserName,
                password: settings.databaseUserPassword,
                database: settings.databaseName,
                synchronize: false,
                logging: false,
                migrations: [__dirname + '/seed/*.{ts,js}'],
                migrationsRun: true,

                migrationsTableName: 'migrations_seed',
                entities,
            }
        ];
    }

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    public constructor(@Inject(Logger) logger: Logger, settings: AppSettings, private service: InitializeService) {
        super('API', settings, logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async onApplicationBootstrap(): Promise<void> {
        await super.onApplicationBootstrap();
        await this.service.initialize();
        if (this.settings.isTesting) {
            this.warn(`Service works in ${this.settings.mode}: some functions could work different way`);
        }
    }
}
