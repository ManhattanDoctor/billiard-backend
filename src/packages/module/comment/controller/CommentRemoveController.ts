import { Controller, Post, Delete, Put, Req, Param, Body, Get, UseGuards, ParseIntPipe } from '@nestjs/common';
import { COMMENT_URL } from '@project/common/api';
import { DefaultController } from '@ts-core/backend';
import { Logger } from '@ts-core/common';
import { Swagger } from '@project/module/swagger';
import { DatabaseService } from '@project/module/database/service';
import * as _ from 'lodash';
import { IUserHolder } from '@project/module/database/user';
import { TransformGroup } from '@project/module/database';
import { CommentForbiddenError, CommentNotFoundError } from '@project/module/core/middleware';
import { UserGuard } from '@project/module/guard';
import { ICommentRemoveDtoResponse } from '@project/common/api/comment';
import { Comment } from '@project/common/comment';
import { PermissionUtil } from '@project/common/util';
import { CommentEntity } from '@project/module/database/comment';

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

@Controller(`${COMMENT_URL}/:id`)
export class CommentRemoveController extends DefaultController<number, ICommentRemoveDtoResponse> {
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

    @Swagger({ name: 'Remove comment', response: Comment })
    @Delete()
    @UseGuards(UserGuard)
    public async executeExtended(@Param('id', ParseIntPipe) commentId: number, @Req() request: IUserHolder): Promise<ICommentRemoveDtoResponse> {
        let item = await this.database.commentGet(commentId, true);
        if (_.isNil(item)) {
            throw new CommentNotFoundError();
        }
        if (!PermissionUtil.commentIsCanRemove(item, request.user)) {
            throw new CommentForbiddenError();
        }
        await CommentEntity.remove(item);
        return item.toObject({ groups: [TransformGroup.PUBLIC] });
    }
}
