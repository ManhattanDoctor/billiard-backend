import { TransformUtil } from '@ts-core/common';
import { TypeormValidableEntity } from '@ts-core/backend';
import { Exclude, ClassTransformOptions, Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, Length, ValidateNested } from 'class-validator';
import { CreateDateColumn, Column, Entity, PrimaryGeneratedColumn, JoinColumn, ManyToOne } from 'typeorm';
import { GAME_PATTERN_NAME_MAX_LENGTH, GAME_PATTERN_NAME_MIN_LENGTH, GameBallCondition, GamePattern, GamePatternStatus, GamePatternType } from '@project/common/game';
import { UserEntity } from '../user';
import * as _ from 'lodash';

@Entity({ name: 'game_pattern' })
export class GamePatternEntity extends TypeormValidableEntity implements GamePattern {
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
    @Length(GAME_PATTERN_NAME_MIN_LENGTH, GAME_PATTERN_NAME_MAX_LENGTH)
    public name: string;

    @Column({ type: 'varchar' })
    @IsEnum(GamePatternType)
    public type: GamePatternType;

    @Column({ type: 'varchar' })
    @IsEnum(GamePatternStatus)
    public status: GamePatternStatus;

    // @Column('json', { transformer: TypeormJSONTransformer.instance })
    @Column({ type: 'json' })
    @IsOptional()
    @Type(() => GameBallCondition)
    public conditions?: Array<GameBallCondition>;

    @CreateDateColumn()
    public created: Date;

    //

    @Exclude()
    @ManyToOne(() => UserEntity, user => user.gamePatterns)
    @JoinColumn({ name: "user_id" })
    @Type(() => UserEntity)
    @ValidateNested()
    public user?: UserEntity;

    @Exclude()
    @Column({ name: 'user_id' })
    @IsNumber()
    public userId: number;

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public toObject(options?: ClassTransformOptions): GamePattern {
        return TransformUtil.fromClass<GamePattern>(this, options);
    }
}
