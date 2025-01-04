import { Controller, Req, Param, Get, UseGuards, ParseIntPipe } from '@nestjs/common';
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
import { ICommentGetDtoResponse } from '@project/common/api/comment';
import { Comment } from '@project/common/comment';
import { CommentEntity } from '@project/module/database/comment';

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

@Controller(`${COMMENT_URL}/:id`)
export class CommentGetController extends DefaultController<number, ICommentGetDtoResponse> {
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

    @Swagger({ name: 'Get comment', response: Comment })
    @Get()
    @UseGuards(UserGuard)
    public async executeExtended(@Param('id', ParseIntPipe) commentId: number, @Req() request: IUserHolder): Promise<ICommentGetDtoResponse> {
        let query = await CommentEntity.createQueryBuilder('comment')
            .where('comment.id = :id', { id: commentId })
            .leftJoinAndSelect('comment.user', 'user')
        this.database.userRelationsAdd(query);

        let item = await query.getOne();
        if (_.isNil(item)) {
            throw new CommentNotFoundError();
        }
        if (item.userId !== request.user.id) {
            throw new CommentForbiddenError();
        }
        return item.toObject({ groups: [TransformGroup.PUBLIC] });
    }
}
