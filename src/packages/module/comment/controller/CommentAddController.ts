import { Controller, Req, Body, Post, UseGuards } from '@nestjs/common';
import { COMMENT_URL } from '@project/common/api';
import { DefaultController } from '@ts-core/backend';
import { Logger } from '@ts-core/common';
import { UnreachableStatementError } from '@ts-core/common';
import { Swagger } from '@project/module/swagger';
import { THROTTLE_LIMIT_SLOW, THROTTLE_TTL_SLOW, UserGuard } from '@project/module/guard';
import { DatabaseService } from '@project/module/database/service';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import * as _ from 'lodash';
import { IUserHolder } from '@project/module/database/user';
import { Length, IsNumber, IsNotEmpty, IsOptional, IsEnum, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { Comment, CommentTargetType, COMMENT_TEXT_MAX_LENGTH, COMMENT_TEXT_MIN_LENGTH } from '@project/common/comment';
import { ICommentAddDto, ICommentAddDtoResponse } from '@project/common/api/comment';
import { CommentEntity } from '@project/module/database/comment';
import { TransformGroup } from '@project/module/database';
import { CommentDisabledError, CommentForbiddenError, TarotSpreadNotFoundError } from '@project/module/core/middleware';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { ParseUtil, PermissionUtil } from '@project/common/util';

// --------------------------------------------------------------------------
//
//  Dto
//
// --------------------------------------------------------------------------

export class CommentAddDto implements ICommentAddDto {
    @ApiProperty()
    @Transform(ParseUtil.inputString)
    @IsString()
    @IsNotEmpty()
    @Length(COMMENT_TEXT_MIN_LENGTH, COMMENT_TEXT_MAX_LENGTH)
    text: string;

    @ApiProperty()
    @IsNumber()
    targetId: number;

    @ApiProperty()
    @IsEnum(CommentTargetType)
    targetType: CommentTargetType;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    traceId?: string;
}

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

@Controller(`${COMMENT_URL}`)
export class CommentAddController extends DefaultController<ICommentAddDto, ICommentAddDtoResponse> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private database: DatabaseService) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    @Swagger({ name: 'Comment add', response: Comment })
    @Post()
    @UseGuards(UserGuard, ThrottlerGuard)
    @Throttle({ default: { limit: THROTTLE_LIMIT_SLOW, ttl: THROTTLE_TTL_SLOW } })
    public async executeExtended(@Body() params: CommentAddDto, @Req() request: IUserHolder): Promise<ICommentAddDtoResponse> {
        let user = request.user;
        if (!PermissionUtil.commentIsCanAdd(user)) {
            throw new CommentDisabledError();
        }

        switch (params.targetType) {
            case CommentTargetType.TAROT_SPREAD:
                let tarotSpread = await this.database.tarotSpreadGet(params.targetId, false);
                if (_.isNil(tarotSpread)) {
                    throw new TarotSpreadNotFoundError();
                }
                if (!PermissionUtil.spreadIsCanGet(tarotSpread, user)) {
                    throw new CommentForbiddenError();
                }
                break;
            default:
                throw new UnreachableStatementError(params.targetType);
        }

        let item = await CommentEntity.saveEntity(user.id, params.text, params.targetId, params.targetType);
        item.user = user;
        return item.toObject({ groups: [TransformGroup.PUBLIC] });
    }
}
