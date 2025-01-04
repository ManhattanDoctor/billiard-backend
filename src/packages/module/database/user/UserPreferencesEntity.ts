import {
    UserPreferences,
    USER_PREFERENCES_NAME_MIN_LENGTH,
    USER_PREFERENCES_NAME_MAX_LENGTH,
    USER_PREFERENCES_DESCRIPTION_MAX_LENGTH,
    USER_PREFERENCES_PHONE_MAX_LENGTH,
    USER_PREFERENCES_STRING_MAX_LENGTH,
    USER_PREFERENCES_PICTURE_MAX_LENGTH,
    USER_PREFERENCES_LOCATION_MAX_LENGTH,
    USER_PREFERENCES_SOCIAL_MAX_LENGTH,
    USER_PREFERENCES_VK_PATTERN,
    USER_PREFERENCES_FACEBOOK_PATTERN,
    USER_PREFERENCES_TELEGRAM_PATTERN,
    USER_PREFERENCES_INSTAGRAM_PATTERN,
    USER_PREFERENCES_NICKNAME_MIN_LENGTH,
    USER_PREFERENCES_NICKNAME_MAX_LENGTH,
} from '@project/common/user';
import { ObjectUtil } from '@ts-core/common';
import { TypeormDecimalTransformer, TypeormValidableEntity } from '@ts-core/backend';
import { Exclude, Type, Expose } from 'class-transformer';
import { IsEmail, IsDate, Length, Matches, IsUrl, IsBoolean, MaxLength, IsNumber, IsOptional, IsString } from 'class-validator';
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './UserEntity';
import { TRANSFORM_PRIVATE, TRANSFORM_SINGLE } from '../TransformGroup';
import * as _ from 'lodash';

@Entity({ name: 'user_preferences' })
export class UserPreferencesEntity extends TypeormValidableEntity implements UserPreferences {
    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    public static createEntity(preferences: Partial<UserPreferences>): UserPreferencesEntity {
        let item = new UserPreferencesEntity();
        ObjectUtil.copyPartial(preferences, item);
        if (_.isString(item.birthday)) {
            item.birthday = new Date(item.birthday);
        }
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
    @Length(USER_PREFERENCES_NAME_MIN_LENGTH, USER_PREFERENCES_NAME_MAX_LENGTH)
    public name: string;

    @Column()
    @IsString()
    @Length(USER_PREFERENCES_NICKNAME_MIN_LENGTH, USER_PREFERENCES_NICKNAME_MAX_LENGTH)
    public nickname: string;

    @Expose({ groups: TRANSFORM_PRIVATE })
    @Column()
    @IsEmail()
    @IsOptional()
    @MaxLength(USER_PREFERENCES_STRING_MAX_LENGTH)
    public email?: string;

    @Expose({ groups: TRANSFORM_PRIVATE })
    @Column()
    @IsString()
    @IsOptional()
    @MaxLength(USER_PREFERENCES_PHONE_MAX_LENGTH)
    public phone?: string;

    @Column()
    @IsString()
    @IsOptional()
    @MaxLength(USER_PREFERENCES_DESCRIPTION_MAX_LENGTH)
    public description?: string;

    @Expose({ groups: TRANSFORM_PRIVATE })
    @Column()
    @IsString()
    @IsOptional()
    @MaxLength(USER_PREFERENCES_DESCRIPTION_MAX_LENGTH)
    public locale?: string;

    @Column()
    @IsString()
    @IsOptional()
    @MaxLength(USER_PREFERENCES_PICTURE_MAX_LENGTH)
    public picture?: string;

    @Column({ name: 'is_male' })
    @IsBoolean()
    @IsOptional()
    public isMale?: boolean;

    @Expose({ groups: TRANSFORM_PRIVATE })
    @Column({ name: 'is_hide_from_people' })
    @IsBoolean()
    @IsOptional()
    public isHideFromPeople?: boolean;

    @Expose({ groups: TRANSFORM_PRIVATE })
    @Column({ name: 'is_not_suggest_show_help' })
    @IsBoolean()
    @IsOptional()
    public isNotSuggestShowHelp: boolean;

    @Expose({ groups: TRANSFORM_PRIVATE })
    @Column({ name: 'is_not_suggest_add_to_profile' })
    @IsBoolean()
    @IsOptional()
    public isNotSuggestAddToProfile?: boolean;

    @Expose({ groups: TRANSFORM_PRIVATE })
    @Column({ name: 'is_not_suggest_add_to_favorites' })
    @IsBoolean()
    @IsOptional()
    public isNotSuggestAddToFavorites?: boolean;

    @Expose({ groups: TRANSFORM_PRIVATE })
    @Column({ name: 'is_not_suggest_allow_send_notifications' })
    @IsBoolean()
    @IsOptional()
    public isNotSuggestAllowSendNotifications?: boolean;

    @Column()
    @IsDate()
    @IsOptional()
    public birthday?: Date;

    @Expose({ groups: TRANSFORM_SINGLE })
    @Column()
    @IsOptional()
    @Matches(USER_PREFERENCES_VK_PATTERN)
    @MaxLength(USER_PREFERENCES_SOCIAL_MAX_LENGTH)
    public vk?: string;

    @Expose({ groups: TRANSFORM_SINGLE })
    @Column()
    @IsOptional()
    @Matches(USER_PREFERENCES_FACEBOOK_PATTERN)
    @MaxLength(USER_PREFERENCES_SOCIAL_MAX_LENGTH)
    public facebook?: string;

    @Expose({ groups: TRANSFORM_SINGLE })
    @Column()
    @IsOptional()
    @Matches(USER_PREFERENCES_TELEGRAM_PATTERN)
    @MaxLength(USER_PREFERENCES_SOCIAL_MAX_LENGTH)
    public telegram?: string;

    @Expose({ groups: TRANSFORM_SINGLE })
    @Column()
    @IsOptional()
    @IsUrl()
    @Matches(USER_PREFERENCES_INSTAGRAM_PATTERN)
    public instagram?: string;

    @Expose({ groups: TRANSFORM_SINGLE })
    @Column()
    @IsString()
    @IsOptional()
    @MaxLength(USER_PREFERENCES_LOCATION_MAX_LENGTH)
    public location?: string;

    @Expose({ groups: TRANSFORM_SINGLE })
    @Column({ type: 'numeric', transformer: TypeormDecimalTransformer.instance })
    @IsNumber()
    @IsOptional()
    public latitude?: number;

    @Expose({ groups: TRANSFORM_SINGLE })
    @Column({ type: 'numeric', transformer: TypeormDecimalTransformer.instance })
    @IsNumber()
    @IsOptional()
    public longitude?: number;

    @Exclude()
    @OneToOne(() => UserEntity, user => user.preferences)
    @JoinColumn({ name: 'user_id' })
    @Type(() => UserEntity)
    public user: UserEntity;
}
