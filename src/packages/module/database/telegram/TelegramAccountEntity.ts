import { TypeormValidableEntity } from '@ts-core/backend';
import { IsNumber, IsEnum, IsOptional } from 'class-validator';
import { Column, CreateDateColumn, UpdateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import * as _ from 'lodash';

@Entity({ name: 'telegram_account' })
export class TelegramAccountEntity extends TypeormValidableEntity {
    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    public static createEntity(accountId: number, userId?: number): TelegramAccountEntity {
        let item = new TelegramAccountEntity();
        item.accountId = accountId;
        item.userId = userId;
        return item;
    }

    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    @PrimaryGeneratedColumn()
    @IsOptional()
    @IsNumber()
    public id: number;

    @Column({ name: 'account_id' })
    @IsNumber()
    public accountId: number;

    @Column({ name: 'user_id' })
    @IsNumber()
    @IsOptional()
    public userId?: number;

    @CreateDateColumn()
    public created: Date;

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public get seed(): number {
        return !_.isNil(this.userId) ? this.userId : this.accountId;
    }
}
