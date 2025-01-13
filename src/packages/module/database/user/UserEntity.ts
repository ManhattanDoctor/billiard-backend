
import { User, UserResource, UserStatus } from '@project/common/user';
import { TypeormValidableEntity } from '@ts-core/backend';
import { Exclude, Expose, ClassTransformOptions, Type } from 'class-transformer';
import { ValidateNested, IsDate, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Column, CreateDateColumn, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserAccountEntity } from './UserAccountEntity';
import { UserPreferencesEntity } from './UserPreferencesEntity';
import { TransformUtil } from '@ts-core/common';
import { UserStatisticsEntity } from './UserStatisticsEntity';
import { CoinAccountEntity } from '../coin';
import { PaymentEntity, PaymentTransactionEntity } from '../payment';
import { TRANSFORM_PRIVATE } from '@project/module/core';
import { GamePartnerEntity, GamePatternEntity, GameSessionEntity } from '../game';
import * as _ from 'lodash';

@Entity({ name: 'user' })
export class UserEntity extends TypeormValidableEntity implements User {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    @PrimaryGeneratedColumn()
    @IsOptional()
    @IsNumber()
    public id: number;

    @Expose({ groups: TRANSFORM_PRIVATE })
    @Column()
    @IsString()
    public login: string;

    @Expose({ groups: TRANSFORM_PRIVATE })
    @Column({ type: 'varchar' })
    @IsEnum(UserResource)
    public resource: UserResource;

    @Expose({ groups: TRANSFORM_PRIVATE })
    @Column({ type: 'varchar' })
    @IsEnum(UserStatus)
    public status: UserStatus;

    @Expose({ groups: TRANSFORM_PRIVATE })
    @CreateDateColumn()
    public created: Date;

    @Expose({ groups: TRANSFORM_PRIVATE })
    @Column({ name: 'last_login' })
    @IsDate()
    public lastLogin: Date;

    @OneToOne(() => UserAccountEntity, account => account.user, { cascade: true })
    @ValidateNested()
    public account: UserAccountEntity;

    @OneToOne(() => UserPreferencesEntity, preferences => preferences.user, { cascade: true })
    @ValidateNested()
    public preferences: UserPreferencesEntity;

    @OneToOne(() => UserStatisticsEntity, statistics => statistics.user, { cascade: true })
    @ValidateNested()
    public statistics: UserStatisticsEntity;

    @Exclude()
    @OneToMany(() => PaymentEntity, item => item.user)
    @Type(() => PaymentEntity)
    public payments?: Array<PaymentEntity>;

    @Exclude()
    @OneToMany(() => CoinAccountEntity, item => item.user)
    @Type(() => CoinAccountEntity)
    public coinAccounts?: Array<CoinAccountEntity>;

    @Exclude()
    @OneToMany(() => PaymentTransactionEntity, item => item.user)
    @Type(() => PaymentTransactionEntity)
    public paymentTransactions?: Array<PaymentTransactionEntity>;

    @Exclude()
    @OneToMany(() => GamePartnerEntity, item => item.user)
    @Type(() => GamePartnerEntity)
    public gamePartners?: Array<GamePartnerEntity>;

    @Exclude()
    @OneToMany(() => GamePatternEntity, item => item.user)
    @Type(() => GamePatternEntity)
    public gamePatterns?: Array<GamePatternEntity>;

    @Exclude()
    @OneToMany(() => GameSessionEntity, item => item.user)
    @Type(() => GameSessionEntity)
    public gameSessions?: Array<GameSessionEntity>;

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public toString(): string {
        return `${this.login} (${this.preferences.name})`;
    }

    public toObject(options?: ClassTransformOptions): User {
        return TransformUtil.fromClass<User>(this, options);
    }
}
