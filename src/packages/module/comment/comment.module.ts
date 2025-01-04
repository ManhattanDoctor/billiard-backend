import { Module } from '@nestjs/common';
import { LoggerModule } from '@ts-core/backend-nestjs';
import { CacheModule } from '@ts-core/backend-nestjs';
import { SharedModule } from '@project/module/shared';
import { DatabaseModule } from '@project/module/database';
import { CommentAddController, CommentGetController, CommentEditController, CommentListController, CommentRemoveController } from './controller';

@Module({
    imports: [LoggerModule, CacheModule, DatabaseModule, SharedModule],
    controllers: [CommentAddController, CommentEditController, CommentRemoveController, CommentListController, CommentGetController],
})
export class CommentModule { }
