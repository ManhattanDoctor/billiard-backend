import { TypeormValidableEntity } from '@ts-core/backend';
import { TransformUtil } from '@ts-core/common';
import { IsEnum, IsNumber, IsString, IsOptional, ValidateNested } from 'class-validator';
import { CreateDateColumn, JoinColumn, ManyToOne, UpdateDateColumn, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../user';
import { Exclude, ClassTransformOptions, Type } from 'class-transformer';
import { CoinAccount, CoinId } from '@project/common/coin';
import * as _ from 'lodash';

@Entity({ name: 'coin_account' })
export class CoinAccountEntity extends TypeormValidableEntity implements CoinAccount {

    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    public static createEntity(userId: number, coinId: CoinId): CoinAccountEntity {
        let item = new CoinAccountEntity();
        item.userId = userId;
        item.coinId = coinId;
        return item;
    }

    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    @Exclude()
    @PrimaryGeneratedColumn()
    @IsOptional()
    @IsNumber()
    public id: number;

    @Column()
    @IsString()
    public amount: string;

    @Column({ type: 'varchar', name: 'coin_id' })
    @IsEnum(CoinId)
    public coinId: CoinId;

    @Column({ name: 'user_id' })
    @IsNumber()
    public userId: number;

    @CreateDateColumn()
    public created: Date;

    @ManyToOne(() => UserEntity, user => user.coinAccounts)
    @IsOptional()
    @ValidateNested()
    @JoinColumn({ name: "user_id" })
    @Type(() => UserEntity)
    public user?: UserEntity;

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public toObject(options?: ClassTransformOptions): CoinAccount {
        return TransformUtil.fromClass<CoinAccount>(this, options);
    }
}
