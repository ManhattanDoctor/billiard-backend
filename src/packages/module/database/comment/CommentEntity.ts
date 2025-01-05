import { TransformUtil } from '@ts-core/common';
import { TypeormValidableEntity } from '@ts-core/backend';
import { Expose, Type, ClassTransformOptions } from 'class-transformer';
import { IsEnum, Length, IsNumber, IsOptional, IsString } from 'class-validator';
import { Column, CreateDateColumn, UpdateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../user';
import { Comment, CommentTargetType, COMMENT_TEXT_MAX_LENGTH, COMMENT_TEXT_MIN_LENGTH } from '@project/common/comment';
import { TRANSFORM_PRIVATE } from '@project/module/core';
import * as _ from 'lodash';

@Entity({ name: 'comment' })
export class CommentEntity extends TypeormValidableEntity implements Comment {

    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    public static createEntity(userId: number, text: string, targetId: number, targetType: CommentTargetType): CommentEntity {
        let item = new CommentEntity();
        item.text = text;
        item.userId = userId;
        item.targetId = targetId;
        item.targetType = targetType;
        return item;
    }

    public static async saveEntity(userId: number, text: string, targetId: number, targetType: CommentTargetType): Promise<CommentEntity> {
        let item = CommentEntity.createEntity(userId, text, targetId, targetType);
        await item.save();
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

    @Column({ type: 'text' })
    @IsString()
    @Length(COMMENT_TEXT_MIN_LENGTH, COMMENT_TEXT_MAX_LENGTH)
    public text: string;;

    @Expose({ groups: TRANSFORM_PRIVATE })
    @Column({ name: 'target_id' })
    @IsNumber()
    public targetId: number;

    @Expose({ groups: TRANSFORM_PRIVATE })
    @Column({ name: 'target_type', type: 'varchar' })
    @IsEnum(CommentTargetType)
    public targetType: CommentTargetType;

    @Column({ name: 'user_id' })
    @IsNumber()
    @IsOptional()
    public userId: number;

    @ManyToOne(() => UserEntity)
    @JoinColumn({ name: 'user_id' })
    @Type(() => UserEntity)
    public user: UserEntity;

    @CreateDateColumn()
    public created: Date;

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public toObject(options?: ClassTransformOptions): Comment {
        return TransformUtil.fromClass<Comment>(this, options);
    }
}

export type TarotSpreadSeedOrIndexes = string | Array<number>;
