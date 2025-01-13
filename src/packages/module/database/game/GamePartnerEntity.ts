import { TransformUtil } from '@ts-core/common';
import { TypeormValidableEntity } from '@ts-core/backend';
import { Exclude, ClassTransformOptions, Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, ValidateNested, Length, IsBoolean } from 'class-validator';
import { CreateDateColumn, JoinColumn, ManyToOne, Column, Entity, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { UserEntity } from '../user';
import { GAME_PARTNER_NAME_MAX_LENGTH, GAME_PARTNER_NAME_MIN_LENGTH, GamePartner, GamePartnerStatus } from '@project/common/game';
import * as _ from 'lodash';
import { GameSessionEntity } from './GameSessionEntity';

@Entity({ name: 'game_partner' })
export class GamePartnerEntity extends TypeormValidableEntity implements GamePartner {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    @PrimaryGeneratedColumn()
    @IsOptional()
    @IsNumber()
    public id: number;

    @Column()
    @Length(GAME_PARTNER_NAME_MIN_LENGTH, GAME_PARTNER_NAME_MAX_LENGTH)
    public name: string;

    @Column({ type: 'varchar' })
    @IsEnum(GamePartnerStatus)
    public status: GamePartnerStatus;

    @Column({ name: 'is_favorite' })
    @IsOptional()
    @IsBoolean()
    public isFavorite?: boolean;

    @ManyToOne(() => UserEntity, user => user.gamePartners)
    @JoinColumn({ name: "user_linked_id" })
    @Type(() => UserEntity)
    @ValidateNested()
    public user?: UserEntity;

    @CreateDateColumn()
    public created: Date;

    //

    @Exclude()
    @Column({ name: 'user_id' })
    @IsNumber()
    public userId: number;

    @Exclude()
    @Column({ name: 'user_linked_id' })
    @IsNumber()
    public userLinkedId: number;

    @Exclude()
    @ManyToMany(() => GameSessionEntity, item => item.partners, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION', })
    public sessions?: Array<GameSessionEntity>;

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public toObject(options?: ClassTransformOptions): GamePartner {
        return TransformUtil.fromClass<GamePartner>(this, options);
    }
}
