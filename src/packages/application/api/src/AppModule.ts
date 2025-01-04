import { DynamicModule, Inject, OnApplicationBootstrap } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { LoggerModule, TransportModule, TransportType, CacheModule } from '@ts-core/backend-nestjs';
import { IDatabaseSettings, ModeApplication } from '@ts-core/backend';
import { AppSettings } from './AppSettings';
import { TarotModule } from '@project/module/tarot';
import { ClockModule } from '@project/module/clock';
import { UserModule } from '@project/module/user';
import { GeoModule } from '@project/module/geo';
import { LoginModule } from '@project/module/login';
import { ManagementModule } from '@project/module/management';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { DatabaseModule } from '@project/module/database';
import { Logger } from '@ts-core/common';
import { modulePath } from '@project/module';
import { MoonModule } from '@project/module/moon';
import { CommentModule } from '@project/module/comment';
import { PeopleModule } from '@project/module/people';
import { OAuthModule } from '@project/module/oauth';
import { NotificationModule } from '@project/module/notification';
import { StatisticsModule } from '@project/module/statistics';
import { THROTTLE_LIMIT_DEFAULT, THROTTLE_TTL_DEFAULT } from '@project/module/guard';
import { InitializeService } from './service';
import { OpenAiModule } from '@project/module/openai';
import { VoiceModule } from '@project/module/voice';
import { LanguageModule } from '@project/module/language';
import { PaymentModule } from '@project/module/payment';
import { TelegramModule } from '@project/module/telegram';
import { CoinModule } from '@project/module/coin';
import { ScheduleModule } from '@nestjs/schedule';
import { VkModule } from '@project/module/vk';
import { MonetaModule } from '@project/module/moneta';
import { DonaterModule } from '@project/module/donater';

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

                ScheduleModule.forRoot(),
                ThrottlerModule.forRoot([{ ttl: THROTTLE_TTL_DEFAULT, limit: THROTTLE_LIMIT_DEFAULT }]),

                GeoModule,
                CoinModule,
                MoonModule,
                UserModule,
                ClockModule,
                TarotModule,
                OAuthModule,
                VoiceModule,
                PeopleModule,
                PaymentModule,
                CommentModule,
                DonaterModule,

                DatabaseModule,
                StatisticsModule,
                ManagementModule,

                LanguageModule.forRoot(`/Users/renat.gubaev/Work/JS/occultist/occultist-backend/locale`),
                // LanguageModule.forRoot(`${process.cwd()}/locale`),
                VkModule.forRoot(settings),
                LoginModule.forRoot(settings),
                MonetaModule.forRoot(settings),
                OpenAiModule.forRoot(settings),
                TelegramModule.forRoot(settings.telegramToken),
                NotificationModule.forRoot(settings),
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
                entities: [
                    `${__dirname}/**/*Entity.{ts,js}`,
                    `${modulePath()}/database/**/*Entity.{ts,js}`,
                    `../../../..node_modules/@ts-core/notification-backend/database/**/*Entity.{ts,js}`
                ],
                autoLoadEntities: true,
                migrations: [__dirname + '/migration/*.{ts,js}'],
                migrationsRun: true
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
                entities: [
                    `${__dirname}/**/*Entity.{ts,js}`,
                    `${modulePath()}/database/**/*Entity.{ts,js}`,
                    `../../../../node_modules/@ts-core/notification-backend/database/**/*Entity.{ts,js}`
                ],
                migrations: [__dirname + '/seed/*.{ts,js}'],
                migrationsRun: true,
                migrationsTableName: 'migrations_seed'
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
