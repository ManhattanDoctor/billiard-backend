import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddComment1627121260005 implements MigrationInterface {
    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async up(queryRunner: QueryRunner): Promise<any> {
        const sql = `
            create table if not exists "comment"
            (
                "id" serial not null 
                    constraint "comment_id_pkey" primary key,
                "user_id" integer
                    constraint "comment_id_fkey" references "user" on delete cascade,
                "text" text not null,
                "target_id" integer not null,
                "target_type" varchar not null,

                "created" timestamp default now() not null
            );
        `;
        await queryRunner.query(sql);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        const sql = `
            drop table if exists "comment" cascade;
        `;
        await queryRunner.query(sql);
    }
}
