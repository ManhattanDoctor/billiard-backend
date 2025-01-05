import { UserAccount, UserAccountType } from '@project/common/user';
import { TypeormValidableEntity } from '@ts-core/backend';
import { Exclude, Type } from 'class-transformer';
import { IsEnum, IsNumber, IsBoolean, IsOptional } from 'class-validator';
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './UserEntity';
import * as _ from 'lodash';

@Entity({ name: 'user_account' })
export class UserAccountEntity extends TypeormValidableEntity implements UserAccount {

    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    public static createEntity(): UserAccountEntity {
        let item = new UserAccountEntity();
        item.type = UserAccountType.FREE;
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

    @Column({ type: 'varchar' })
    @IsEnum(UserAccountType)
    public type: UserAccountType;

    @Column({ name: 'is_disable_bonuses' })
    @IsOptional()
    @IsBoolean()
    public isDisableBonuses?: boolean;

    @Column({ name: 'is_disable_comment_add' })
    @IsOptional()
    @IsBoolean()
    public isDisableCommentAdd?: boolean;
    
    @Exclude()
    @Column({ name: 'user_id' })
    public userId: number;

    @Exclude()
    @OneToOne(() => UserEntity, user => user.account)
    @JoinColumn({ name: 'user_id' })
    @Type(() => UserEntity)
    public user: UserEntity;
}
