import { TransformUtil } from '@ts-core/common';
import { TypeormValidableEntity } from '@ts-core/backend';
import { Exclude, ClassTransformOptions, Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, Length, ValidateNested, Matches } from 'class-validator';
import { CreateDateColumn, Column, Entity, PrimaryGeneratedColumn, JoinColumn, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { GAME_SESSION_CODE_MAX_LENGTH, GAME_SESSION_CODE_MIN_LENGTH, GAME_SESSION_CODE_REGEXP, GAME_SESSION_NAME_MAX_LENGTH, GAME_SESSION_NAME_MIN_LENGTH, GameBallCondition, GamePattern, GamePatternType, GameSession, GameSessionStatus } from '@project/common/game';
import { UserEntity } from '../user';
import { CoinId } from '@project/common/coin';
import { GamePartnerEntity } from './GamePartnerEntity';
import * as _ from 'lodash';

@Entity({ name: 'game_session' })
export class GameSessionEntity extends TypeormValidableEntity implements GameSession {
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
    @Length(GAME_SESSION_NAME_MIN_LENGTH, GAME_SESSION_NAME_MAX_LENGTH)
    public name: string;

    @Column({ type: 'varchar' })
    @IsEnum(GamePatternType)
    public type: GamePatternType;

    @Column({ type: 'varchar' })
    @Length(GAME_SESSION_CODE_MIN_LENGTH, GAME_SESSION_CODE_MAX_LENGTH)
    @Matches(GAME_SESSION_CODE_REGEXP)
    public code: string;

    @Column({ type: 'varchar' })
    @IsEnum(GameSessionStatus)
    public status: GameSessionStatus;

    @ManyToOne(() => UserEntity, user => user.gamePatterns)
    @JoinColumn({ name: "user_id" })
    @Type(() => UserEntity)
    @ValidateNested()
    public user?: UserEntity;

    @ManyToMany(() => GamePartnerEntity, item => item.sessions, { onDelete: 'CASCADE' })
    @JoinTable({ name: 'game_session_game_partner', joinColumn: { name: 'game_session_id', referencedColumnName: 'id' }, inverseJoinColumn: { name: 'game_partner_id', referencedColumnName: 'id' } })
    public partners?: Array<GamePartnerEntity>;

    // @Column('json', { transformer: TypeormJSONTransformer.instance })
    @Column({ type: 'json' })
    @IsOptional()
    @Type(() => GameBallCondition)
    public conditions?: Array<GameBallCondition>;

    @Column({ type: 'varchar' })
    @IsOptional()
    @IsEnum(CoinId)
    public coinId?: CoinId;

    @CreateDateColumn()
    public created: Date;

    //

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
