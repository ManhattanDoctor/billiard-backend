import { UserStatistics } from '@project/common/user';
import { TypeormValidableEntity } from '@ts-core/backend';
import { Exclude, Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './UserEntity';

@Entity({ name: 'user_statistics' })
export class UserStatisticsEntity extends TypeormValidableEntity implements UserStatistics {
    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    public static createEntity(userId: number): UserStatisticsEntity {
        let item = new UserStatisticsEntity();
        item.userId = userId;
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

    @Exclude()
    @Column({ name: 'user_id' })
    @IsNumber()
    public userId: number;

    @Exclude()
    @OneToOne(() => UserEntity, user => user.statistics)
    @JoinColumn({ name: 'user_id' })
    @Type(() => UserEntity)
    public user: UserEntity;
}
