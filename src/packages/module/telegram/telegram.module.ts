import { DynamicModule } from '@nestjs/common';
import { SharedModule } from '@project/module/shared';
import { TelegramAccountAddController, TelegramAccountRemoveController } from './controller';
import { DatabaseModule } from '@project/module/database';

export class TelegramModule {
    // --------------------------------------------------------------------------
    //
    //  Public Static Methods
    //
    // --------------------------------------------------------------------------

    public static forRoot(token: string): DynamicModule {
        return {
            module: TelegramModule,
            imports: [
                SharedModule,
                DatabaseModule
            ],
            providers: [
                {
                    provide: 'TELEGRAM_TOKEN',
                    useValue: token
                }
            ],
            controllers: [TelegramAccountAddController, TelegramAccountRemoveController]
        };
    }
}