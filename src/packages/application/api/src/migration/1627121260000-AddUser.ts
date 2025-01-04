import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUser1627121260000 implements MigrationInterface {
    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async up(queryRunner: QueryRunner): Promise<any> {
        const sql = `
            create table if not exists "user"
            (
                "id" serial not null 
                    constraint "user_id_pkey" primary key,
                "login" varchar not null 
                    constraint "user_login_pkey" unique,
                "resource" varchar not null,
                "status" varchar not null,
                "created" timestamp default now() not null
            );

            create table if not exists "user_account"
            (
                "id" serial not null 
                    constraint "user_account_id_pkey" primary key,
                "user_id" integer
                    constraint "user_account_user_id_key" unique
                    constraint "user_account_user_id_fkey" references "user" on delete cascade,
                "type" varchar not null,
                "is_disable_comment_add" boolean
            );

            create table if not exists "user_preferences"
            (
                "id" serial not null 
                    constraint "user_preferences_id_pkey" primary key,
                "user_id" integer
                    constraint "user_preferences_user_id_key" unique
                    constraint "user_preferences_user_id_fkey" references "user" on delete cascade,

                "name" varchar not null,
                "nickname" varchar not null constraint "user_preferences_nickname_key" unique,
                "phone" varchar,
                "email" varchar,
                "locale" varchar,
                "picture" varchar,
                "is_male" boolean,
                "birthday" timestamp,
                "description" varchar,

                "location" varchar,
                "latitude" numeric,
                "longitude" numeric

                "vk" varchar,
                "facebook" varchar,
                "telegram" varchar,
                "instagram" varchar,

                "is_hide_from_people" boolean,
                "is_not_suggest_show_help" boolean,
                "is_not_suggest_add_to_profile" boolean,
                "is_not_suggest_add_to_favorites" boolean,
                "is_not_suggest_allow_send_notifications" boolean,
            );

            create table if not exists "user_statistics"
            (
                "id" serial not null 
                    constraint "user_statistics_id_pkey" primary key,
                "user_id" integer
                    constraint "user_statistics_user_id_key" unique
                    constraint "user_statistics_user_id_fkey" references "user" on delete cascade
            );
        `;
        await queryRunner.query(sql);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        const sql = `
            drop table if exists "user" cascade;
            drop table if exists "user_account" cascade;
            drop table if exists "user_preferences" cascade;
        `;
        await queryRunner.query(sql);
    }
}
