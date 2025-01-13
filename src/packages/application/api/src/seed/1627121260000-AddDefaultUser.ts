import { MigrationInterface, QueryRunner } from 'typeorm';
import { UserAccountEntity, UserEntity, UserPreferencesEntity } from '@project/module/database/user';
import { UserAccountType, UserResource, UserStatus } from '@project/common/user';
import { LoginService } from '@project/module/login/service';
import { ValidateUtil } from '@ts-core/common';
import * as _ from 'lodash';

export class AddDefaultUser1627121260000 implements MigrationInterface {
    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    public static getLogin(): string {
        return LoginService.createLogin('111452810894131754642', UserResource.GOOGLE);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async up(queryRunner: QueryRunner): Promise<any> {
        let repository = queryRunner.connection.getRepository(UserEntity);
        let login = AddDefaultUser1627121260000.getLogin();

        let item = await repository.findOneBy({ login });
        if (!_.isNil(item)) {
            return;
        }

        item = new UserEntity();
        item.login = login;
        item.status = UserStatus.ACTIVE;
        item.account = UserAccountEntity.createEntity(UserAccountType.ADMINISTRATOR);
        item.resource = UserResource.GOOGLE;
        item.lastLogin = new Date();
        item.preferences = UserPreferencesEntity.createEntity({ name: 'Anter Athanor', nickname: 'anter.athanor' });

        await repository.save(item);
    }

    public async down(queryRunner: QueryRunner): Promise<any> { }
}
