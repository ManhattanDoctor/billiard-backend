import { AbstractSettings } from '@project/module/core';
import { IVkStrategySettings, IJwtStrategySettings, IYaStrategySettings, IVkStrategyInternalSettings, IGoStrategySettings, ITgStrategySettings } from '@project/module/login/strategy';
import { INotificationSettings } from '@project/module/notification';
import { IDatabaseSettings, IWebSettings } from '@ts-core/backend';

export class AppSettings extends AbstractSettings
    implements IJwtStrategySettings, IYaStrategySettings, IGoStrategySettings, IVkStrategyInternalSettings, IVkStrategySettings, ITgStrategySettings, IWebSettings, IDatabaseSettings, INotificationSettings {
    // --------------------------------------------------------------------------
    //
    //  Public Database Properties
    //
    // --------------------------------------------------------------------------

    public get databaseUri(): string {
        return null;
    }

    public get databaseHost(): string {
        return this.getValue('POSTGRES_DB_HOST');
    }

    public get databasePort(): number {
        return this.getValue('POSTGRES_DB_PORT', 5432);
    }

    public get databaseName(): string {
        return this.getValue('POSTGRES_DB');
    }

    public get databaseUserName(): string {
        return this.getValue('POSTGRES_USER');
    }

    public get databaseUserPassword(): string {
        return this.getValue('POSTGRES_PASSWORD');
    }

    // --------------------------------------------------------------------------
    //
    //  Web Properties
    //
    // --------------------------------------------------------------------------

    public get webPort(): number {
        return this.getValue('WEB_PORT', 3005);
    }

    public get webHost(): string {
        return this.getValue('WEB_HOST', 'localhost');
    }

    // --------------------------------------------------------------------------
    //
    //  JWT Properties
    //
    // --------------------------------------------------------------------------

    public get jwtSecret(): string {
        return this.getValue('JWT_SECRET');
    }

    public get jwtExpiresTimeout(): number {
        return this.getValue('JWT_EXPIRES_TIMEOUT', 3110400000);
    }

    // --------------------------------------------------------------------------
    //
    //  Redis Properties
    //
    // --------------------------------------------------------------------------

    public get redisHost(): string {
        return this.getValue('REDIS_HOST');
    }

    public get redisPort(): string {
        return this.getValue('REDIS_PORT');
    }

    // --------------------------------------------------------------------------
    //
    //  Google Properties
    //
    // --------------------------------------------------------------------------

    public get goSiteId(): string {
        return this.getValue('GO_SITE_ID');
    }

    public get goSiteSecret(): string {
        return this.getValue('GO_SITE_SECRET');
    }

    // --------------------------------------------------------------------------
    //
    //  Yandex Properties
    //
    // --------------------------------------------------------------------------

    public get yaSiteId(): string {
        return this.getValue('YA_SITE_ID');
    }

    public get yaSiteSecret(): string {
        return this.getValue('YA_SITE_SECRET');
    }

    // --------------------------------------------------------------------------
    //
    //  Mail Properties
    //
    // --------------------------------------------------------------------------

    public get maSiteId(): string {
        return this.getValue('MA_SITE_ID');
    }

    public get maSiteSecret(): string {
        return this.getValue('MA_SITE_SECRET');
    }

    // --------------------------------------------------------------------------
    //
    //  Vk Properties
    //
    // --------------------------------------------------------------------------

    public get vkSiteId(): string {
        return this.getValue('VK_SITE_ID');
    }

    public get vkSiteSecret(): string {
        return this.getValue('VK_SITE_SECRET');
    }

    public get vkInternalSecret(): string {
        return this.getValue('VK_INTERNAL_SECRET');
    }

    public get vkInternalService(): string {
        return this.getValue('VK_INTERNAL_SERVICE');
    }

    public get vkGroupSecret(): string {
        return this.getValue('VK_GROUP_SECRET');
    }

    // --------------------------------------------------------------------------
    //
    //  OpenAI Properties
    //
    // --------------------------------------------------------------------------

    public get openAiSecret(): string {
        return this.getValue('OPEN_AI_SECRET');
    }

    // --------------------------------------------------------------------------
    //
    //  Telegram Properties
    //
    // --------------------------------------------------------------------------

    public get telegramToken(): string {
        return this.getValue('TELEGRAM_TOKEN');
    }

    // --------------------------------------------------------------------------
    //
    //  OneSignal Properties
    //
    // --------------------------------------------------------------------------

    public get oneSignalSiteId(): string {
        return this.getValue('ONE_SIGNAL_SITE_ID');
    }

    public get oneSignalSiteSecret(): string {
        return this.getValue('ONE_SIGNAL_SITE_SECRET');
    }

    // --------------------------------------------------------------------------
    //
    //  Moneta Properties
    //
    // --------------------------------------------------------------------------

    public get monetaSecret(): string {
        return this.getValue('MONETA_SECRET');
    }
}
