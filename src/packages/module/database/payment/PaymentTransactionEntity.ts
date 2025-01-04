import { TransformUtil, MathUtil } from '@ts-core/common';
import { TypeormValidableEntity } from '@ts-core/backend';
import { Type, ClassTransformOptions } from 'class-transformer';
import { IsString, ValidateNested, IsDate, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { CreateDateColumn, JoinColumn, ManyToOne, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { PaymentAccountId, PaymentTransaction, PaymentTransactionItemType, PaymentTransactionType } from '@project/common/payment';
import { PaymentEntity } from './PaymentEntity';
import { UserEntity } from '../user';
import { CoinId } from '@project/common/coin';
import * as _ from 'lodash';

@Entity({ name: 'payment_transaction' })
export class PaymentTransactionEntity extends TypeormValidableEntity implements PaymentTransaction {

    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    public static createEntity(userId: number, type: PaymentTransactionType, coinId: CoinId, amount: string, itemType?: PaymentTransactionItemType, itemId?: number): PaymentTransactionEntity {
        let item = new PaymentTransactionEntity();
        item.type = type;
        item.userId = userId;
        item.coinId = coinId;
        item.amount = amount;
        item.itemId = itemId;
        item.itemType = itemType;
        item.created = item.activated = new Date();

        switch (type) {
            case PaymentTransactionType.CORRECTION:
                item.debet = MathUtil.lessThan(amount, '0') ? PaymentAccountId.CO_00 : PaymentAccountId.PR_00;
                item.credit = MathUtil.lessThan(amount, '0') ? PaymentAccountId.PR_00 : PaymentAccountId.CO_00;
                item.amount = MathUtil.abs(amount);
                break;

            case PaymentTransactionType.REFUND:
            case PaymentTransactionType.PURCHASE:
                item.debet = PaymentAccountId.PR_00;
                item.credit = PaymentAccountId.CO_00;
                break;

            /*
            case PaymentTransactionType.TAROT_SPREAD_MEANING_PURCHASE:
            case PaymentTransactionType.TAROT_SPREAD_MEANING_AI_PURCHASE:
                item.debet = PaymentAccountId.CO_00;
                item.credit = PaymentAccountId.PR_00;
                break;
            */
        }

        return item;
    }

    public static async saveEntity(userId: number, type: PaymentTransactionType, coinId: CoinId, amount: string, itemType?: PaymentTransactionItemType, itemId?: number): Promise<PaymentTransactionEntity> {
        return PaymentTransactionEntity.createEntity(userId, type, coinId, amount, itemType, itemId).save();
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

    @Column({ type: 'varchar' })
    @IsString()
    public type: PaymentTransactionType;

    @Column({ type: 'varchar' })
    @IsEnum(PaymentAccountId)
    public debet: PaymentAccountId;

    @Column({ type: 'varchar' })
    @IsEnum(PaymentAccountId)
    public credit: PaymentAccountId;

    @Column({ type: 'numeric' })
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

    @Column({ name: 'payment_id' })
    @IsOptional()
    @IsNumber()
    public paymentId?: number;

    @Column({ name: 'item_id' })
    @IsOptional()
    @IsNumber()
    public itemId?: number;

    @Column({ type: 'varchar', name: 'item_type' })
    @IsOptional()
    @IsEnum(PaymentTransactionItemType)
    public itemType?: PaymentTransactionItemType;

    @Column()
    @IsOptional()
    @IsDate()
    public activated?: Date;

    @ManyToOne(() => UserEntity, user => user.paymentTransactions)
    @IsOptional()
    @JoinColumn({ name: "user_id" })
    @Type(() => UserEntity)
    @ValidateNested()
    public user?: UserEntity;

    @ManyToOne(() => PaymentEntity, payment => payment.transactions)
    @JoinColumn({ name: 'payment_id' })
    @Type(() => PaymentEntity)
    public payment?: PaymentEntity;

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public toObject(options?: ClassTransformOptions): PaymentTransaction {
        return TransformUtil.fromClass<PaymentTransaction>(this, options);
    }
}
