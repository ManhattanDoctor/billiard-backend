import { Global, Module } from '@nestjs/common';
import { SharedModule } from '@project/module/shared';
import { CoinAccountUpdateHandler } from './transport/handler';
import { CoinAccountsGetController, CoinBalanceEditController, CoinStatusGetController } from './controller';
import { LoggerModule } from '@ts-core/backend-nestjs';
import { DatabaseModule } from '@project/module/database';
import { CoinService } from './service';

@Global()
@Module({
    imports: [LoggerModule, SharedModule, DatabaseModule],
    providers: [CoinService, CoinAccountUpdateHandler],
    controllers: [CoinBalanceEditController, CoinStatusGetController, CoinAccountsGetController],
    exports: [CoinService]
})
export class CoinModule { }