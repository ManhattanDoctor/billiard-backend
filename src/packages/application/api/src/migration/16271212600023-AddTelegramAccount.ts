import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTelegramAccount16271212600023 implements MigrationInterface {
    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async up(queryRunner: QueryRunner): Promise<any> {
        const sql = `
            create table if not exists "telegram_account"
            (
                "id" serial not null 
                    constraint "telegram_account_id_pkey" primary key,

                "user_id" integer
                    constraint "telegram_account_user_id_key" unique
                    constraint "telegram_account_user_id_fkey" references "user" on delete cascade,
                    
                "account_id" bigint not null,

                "created" timestamp default now() not null
            );
        `;
        await queryRunner.query(sql);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        const sql = `
            drop table if exists "telegram_account" cascade;
        `;
        await queryRunner.query(sql);
    }
}
