import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGame1627121260009 implements MigrationInterface {
    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async up(queryRunner: QueryRunner): Promise<any> {
        const sql = `
            create table if not exists "game_partner"
            (
                "id" serial not null 
                    constraint "game_partner_id_pkey" primary key,

                "user_id" integer not null
                    constraint "game_partner_user_id_fkey" references "user" on delete cascade,

                "user_linked_id" integer
                    constraint "game_partner_user_linked_id_fkey" references "user",

                "name" varchar not null,
                "status" varchar not null,
                "is_favorite" boolean,
                
                "created" timestamp default now() not null
            );

            create unique index "game_partner_ukey_user_id_user_linked_id" on "game_partner" (user_id, user_linked_id) nulls not distinct;

            create table if not exists "game_pattern"
            (
                "id" serial not null 
                    constraint "game_pattern_id_pkey" primary key,

                "user_id" integer
                    constraint "game_partner_user_id_fkey" references "user" on delete cascade,

                "name" varchar not null,
                "type" varchar not null,
                "status" varchar not null,
                "conditions" json array,
                
                "created" timestamp default now() not null
            );

            create table if not exists "game_session"
            (
                "id" serial not null 
                    constraint "game_session_id_pkey" primary key,

                "name" varchar not null,
                "type" varchar not null,
                "code" varchar not null,
                "status" varchar not null,

                "user_id" integer not null
                    constraint "game_session_user_id_fkey" references "user" on delete cascade,

                "coin_id" varchar,
                "shuffling" varchar,
                "permission" json,
                "multiplier" numeric,
                "conditions" json array
            );

            create table if not exists "game_session_game_partner"
            (
                "game_session_id" integer not null references "game_session" (id) on delete cascade,
                "game_partner_id" integer not null references "game_partner" (id) on delete cascade,

                primary key (game_session_id, game_partner_id)
            );
        `;

        /*
            create table if not exists "game"
            (
                "id" serial not null 
                    constraint "game_id_pkey" primary key,

                "game_session_id" integer not null
                    constraint "game_game_session_id_fkey" references "game_session" on delete cascade,

                "multiplier" numeric
            );

            create table if not exists "game_game_partner"
            (
                "game_id" integer not null references "game" (id) on delete cascade,
                "game_partner_id" integer not null references "game_partner" (id) on delete cascade,

                primary key (game_id, game_partner_id)
            );

            create table if not exists "game_ball"
            (
                "id" serial not null 
                    constraint "game_ball_id_pkey" primary key,

                "game_id" integer not null
                    constraint "game_ball_game_id_fkey" references "game" on delete cascade,

                "game_partner_id" integer not null
                    constraint "game_ball_game_partner_id_fkey" references "game_partner" on delete cascade,

                "tags" json array
            );

            create table if not exists "game_partner_result"
            (
                "id" serial not null 
                    constraint "game_partner_result_id_pkey" primary key,

                "game_id" integer not null
                    constraint "game_partner_result_game_id_fkey" references "game" on delete cascade,

                "game_partner_id" integer not null
                    constraint "game_partner_result_game_partner_id_fkey" references "game_partner" on delete cascade,

                "score" json not null,
                "balance" json
            );

            create table if not exists "game_session_transaction"
            (
                "id" serial not null 
                    constraint "game_session_transaction_id_pkey" primary key,

                "type" varchar not null,
                "status" varchar not null,

                "game_session_id" integer not null
                    constraint "game_session_transaction_game_session_id_fkey" references "game_session" on delete cascade,
                
                "game_id" integer
                    constraint "game_session_transaction_game_id_fkey" references "game" on delete cascade,
                
                "game_ball_id" integer
                    constraint "game_session_transaction_game_id_fkey" references "game" on delete cascade,

                "debit_id" integer
                    constraint "game_session_transaction_debit_id_fkey" references "game_partner" on delete cascade,

                "credit_id" integer
                    constraint "game_session_transaction_cr_id_fkey" references "game_partner" on delete cascade,

                "score" integer,
                "amount" numeric,
                "coin_id" varchar,

                "created" timestamp default now() not null
            );
        */
        await queryRunner.query(sql);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        const sql = `
            drop table if exists "game_partner" cascade;
            drop index if exists "game_partner_ukey_user_id_user_linked_id";
        `;
        await queryRunner.query(sql);
    }
}
