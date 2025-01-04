import { Module } from '@nestjs/common';
import { SharedModule } from '@project/module/shared';
import { DatabaseModule } from '@project/module/database';
import { OAuthGetController } from './controller';

@Module({
    imports: [DatabaseModule, SharedModule],
    controllers: [OAuthGetController]
})
export class OAuthModule { }
