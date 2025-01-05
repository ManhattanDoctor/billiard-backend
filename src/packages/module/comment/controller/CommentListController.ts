import { Controller, Get, Req, Query, UseGuards } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DefaultController } from '@ts-core/backend-nestjs';
import { TypeormUtil } from '@ts-core/backend';
import { FilterableConditions, FilterableSort, IPagination, Paginable } from '@ts-core/common';
import { Logger } from '@ts-core/common';
import { IsOptional, Min, IsString } from 'class-validator';
import * as _ from 'lodash';
import { Type } from 'class-transformer';
import { DatabaseService } from '@project/module/database/service';
import { Swagger } from '@project/module/swagger';
import { IUserHolder } from '@project/module/database/user';
import { Comment, CommentTargetType } from '@project/common/comment';
import { COMMENT_URL } from '@project/common/api';
import { CommentEntity } from '@project/module/database/comment';
import { UserGuard } from '@project/module/guard';
import { CommentForbiddenError, RequestInvalidError } from '@project/module/core/middleware';
import { TransformGroup } from '@project/module/database';
import { PermissionUtil } from '@project/common/util';

// --------------------------------------------------------------------------
//
//  Dto
//
// --------------------------------------------------------------------------

export class CommentListDto implements Paginable<Comment> {
    @ApiProperty()
    conditions: FilterableConditions<Comment>;

    @ApiPropertyOptional()
    sort?: FilterableSort<Comment>;

    @ApiPropertyOptional({ default: Paginable.DEFAULT_PAGE_SIZE })
    @Type(() => Number)
    @Min(0)
    pageSize: number;

    @ApiPropertyOptional({ default: Paginable.DEFAULT_PAGE_INDEX })
    @Type(() => Number)
    @Min(0)
    pageIndex: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    traceId?: string;
}

export class CommentListDtoResponse implements IPagination<Comment> {
    @ApiProperty()
    pageSize: number;

    @ApiProperty()
    pageIndex: number;

    @ApiProperty()
    pages: number;

    @ApiProperty()
    total: number;

    @ApiProperty({ isArray: true, type: Comment })
    items: Array<Comment>;
}

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

@Controller(COMMENT_URL)
export class CommentListController extends DefaultController<CommentListDto, CommentListDtoResponse> {
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

    @Swagger({ name: 'Get tarot spread list', response: CommentListDtoResponse })
    @Get()
    @UseGuards(UserGuard)
    public async executeExtended(@Query({ transform: Paginable.transform }) params: CommentListDto, @Req() request: IUserHolder): Promise<CommentListDtoResponse> {
        if (_.isNil(params.conditions)) {
            throw new RequestInvalidError({ name: 'conditions', value: params.conditions })
        }
        if (_.isNil(params.conditions.targetType)) {
            throw new RequestInvalidError({ name: 'conditions.targetType', value: params.conditions.targetType })
        }
        if (_.isNil(params.conditions.targetId) || _.isArray(params.conditions.targetId)) {
            throw new RequestInvalidError({ name: 'conditions.targetId', value: params.conditions.targetId })
        }
        /*
        if (params.conditions.targetType === CommentTargetType.TAROT_SPREAD) {
            let item = await this.database.tarotSpreadGet(params.conditions.targetId as number, false);
            if (!PermissionUtil.spreadIsCanGet(item, request.user)) {
                throw new CommentForbiddenError();
            }
        }
        else {
            throw new RequestInvalidError({ name: 'conditions.targetType', value: params.conditions.targetType as any, expected: [CommentTargetType.TAROT_SPREAD] })
        }
        */

        let query = CommentEntity.createQueryBuilder('сomment');
        query.where('сomment.targetId = :targetId', { targetId: params.conditions.targetId })
        query.andWhere('сomment.targetType = :targetType', { targetType: params.conditions.targetType })
        this.database.commentRelationsAdd(query);

        return TypeormUtil.toPagination(query, params, this.transform);
    }

    protected transform = async (item: CommentEntity): Promise<Comment> => item.toObject({ groups: [TransformGroup.LIST] });
}
