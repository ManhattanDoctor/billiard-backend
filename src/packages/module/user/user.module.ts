import { Module } from '@nestjs/common';
import { DatabaseModule } from '@project/module/database';
import { SharedModule } from '@project/module/shared';
import { UserEditController, UserGetController, UserListController, UserSearchController } from './controller';
import { UserService } from './service';

let providers = [UserService];

@Module({
    imports: [SharedModule, DatabaseModule],
    exports: [...providers],
    controllers: [UserGetController, UserListController, UserEditController, UserSearchController],
    providers
})
export class UserModule { }