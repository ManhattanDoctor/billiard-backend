import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCoinAccount16271212600024 implements MigrationInterface {
    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async up(queryRunner: QueryRunner): Promise<any> {
        const sql = `
            create table if not exists "coin_account"
            (                
                "id" serial not null
                    constraint "coin_account_id_pkey" primary key,

                "user_id" integer not null
                    constraint "coin_account_user_id_fkey" references "user" on delete cascade,

                "amount" numeric not null,
                "coin_id" varchar not null,
                
                "created" timestamp default now() not null
            );

            create unique index "coin_account_ukey_coin_id_user_id" on "coin_account" (coin_id, user_id);
        `;
        await queryRunner.query(sql);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        const sql = `
            drop table if exists "coin_account" cascade;
            drop index if exists "coin_account_ukey_coin_id_user_id";
        `;
        await queryRunner.query(sql);
    }
}
