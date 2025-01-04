import { TransformUtil } from '@ts-core/common';
import { TypeormValidableEntity, TypeormJSONTransformer } from '@ts-core/backend';
import { Exclude, ClassTransformOptions, Type } from 'class-transformer';
import { IsString, IsEnum, IsJSON, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { CreateDateColumn, OneToMany, JoinColumn, ManyToOne, UpdateDateColumn, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../user';
import { Payment, PaymentAggregatorType, PaymentStatus } from '@project/common/payment';
import { PaymentTransactionEntity } from './PaymentTransactionEntity';
import * as _ from 'lodash';

@Entity({ name: 'payment' })
export class PaymentEntity extends TypeormValidableEntity implements Payment {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    @PrimaryGeneratedColumn()
    @IsOptional()
    @IsNumber()
    public id: number;

    @Column({ name: 'user_id' })
    @IsNumber()
    public userId: number;

    @Column({ type: 'varchar' })
    @IsEnum(PaymentStatus)
    public status: PaymentStatus;

    @Column({ type: 'varchar' })
    @IsEnum(PaymentAggregatorType)
    public aggregator: PaymentAggregatorType;

    @OneToMany(() => PaymentTransactionEntity, transaction => transaction.payment, { cascade: true, eager: true })
    @Type(() => PaymentTransactionEntity)
    @ValidateNested()
    public transactions: Array<PaymentTransactionEntity>;

    @CreateDateColumn()
    public created: Date;

    @ManyToOne(() => UserEntity, user => user.payments)
    @JoinColumn({ name: "user_id" })
    @Type(() => UserEntity)
    @ValidateNested()
    public user?: UserEntity;

    @Exclude()
    @Column({ type: 'json', transformer: TypeormJSONTransformer.instance })
    @IsOptional()
    @IsJSON()
    public details?: any;

    @Column({ name: 'transaction_id' })
    @IsOptional()
    @IsString()
    public transactionId?: string;

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public toObject(options?: ClassTransformOptions): Payment {
        return TransformUtil.fromClass<Payment>(this, options);
    }
}
