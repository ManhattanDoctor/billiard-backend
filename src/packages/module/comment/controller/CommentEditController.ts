import { Controller, Post, Put, Req, Param, Body, Get, UseGuards, ParseIntPipe } from '@nestjs/common';
import { COMMENT_URL } from '@project/common/api';
import { DefaultController } from '@ts-core/backend';
import { Logger } from '@ts-core/common';
import { ObjectUtil } from '@ts-core/common';
import { Swagger } from '@project/module/swagger';
import { DatabaseService } from '@project/module/database/service';
import * as _ from 'lodash';
import { IsNotEmpty, Length, IsNumber, IsOptional, IsString } from 'class-validator';
import { IUserHolder } from '@project/module/database/user';
import { TransformGroup } from '@project/module/database';
import { CommentForbiddenError, CommentNotFoundError } from '@project/module/core/middleware';
import { THROTTLE_LIMIT_SLOW, THROTTLE_TTL_SLOW, UserGuard } from '@project/module/guard';
import { ICommentEditDto, ICommentEditDtoResponse } from '@project/common/api/comment';
import { Comment, COMMENT_TEXT_MAX_LENGTH, COMMENT_TEXT_MIN_LENGTH } from '@project/common/comment';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ParseUtil, PermissionUtil } from '@project/common/util';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Transform } from 'class-transformer';
import { CommentEntity } from '@project/module/database/comment';

// --------------------------------------------------------------------------
//
//  Dto
//
// --------------------------------------------------------------------------

export class CommentEditDto implements ICommentEditDto {
    @ApiProperty()
    @IsNumber()
    id: number;

    @ApiProperty()
    @Transform(ParseUtil.inputString)
    @IsString()
    @IsNotEmpty()
    @Length(COMMENT_TEXT_MIN_LENGTH, COMMENT_TEXT_MAX_LENGTH)
    text: string;

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

@Controller(`${COMMENT_URL}/:id`)
export class CommentEditController extends DefaultController<ICommentEditDto, ICommentEditDtoResponse> {
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

    @Swagger({ name: 'Edit comment', response: Comment })
    @Put()
    @UseGuards(UserGuard, ThrottlerGuard)
    @Throttle({ default: { limit: THROTTLE_LIMIT_SLOW, ttl: THROTTLE_TTL_SLOW } })
    public async executeExtended(@Param('id', ParseIntPipe) commentId: number, @Body() params: CommentEditDto, @Req() request: IUserHolder): Promise<ICommentEditDtoResponse> {
        let item = await this.database.commentGet(commentId, true);
        if (_.isNil(item)) {
            throw new CommentNotFoundError();
        }
        if (!PermissionUtil.commentIsCanEdit(item, request.user)) {
            throw new CommentForbiddenError();
        }

        ObjectUtil.copyPartial(params, item, ['text']);
        await item.save();

        return item.toObject({ groups: [TransformGroup.PUBLIC] });
    }
}
