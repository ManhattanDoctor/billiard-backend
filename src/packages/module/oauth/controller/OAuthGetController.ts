import { Controller, Query, Get, Param, Response, UseGuards } from '@nestjs/common';
import { DefaultController } from '@ts-core/backend-nestjs';
import { Logger, DateUtil, ExtendedError } from '@ts-core/common';
import { IOAuthPopUpDto, OAuthParser } from '@ts-core/oauth';
import { ErrorCode, OAUTH_URL } from '@project/common/api';
import { Response as ExpressResponse } from 'express';
import * as _ from 'lodash';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { THROTTLE_LIMIT_FAST, THROTTLE_TTL_FAST } from '@project/module/guard';
import { ApiProperty } from '@nestjs/swagger';
import { Length, IsString } from 'class-validator';

// --------------------------------------------------------------------------
//
//  Dto
//
// --------------------------------------------------------------------------

export class OAuthDto {
    @ApiProperty()
    @IsString()
    @Length(4, 64)
    public state: string;
}

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

@Controller()
export class OAuthGetController extends DefaultController<any, void> {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    private map: Map<string, IOAuthData>;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger) {
        super(logger);
        this.map = new Map();
        setInterval(this.clear, DateUtil.MILLISECONDS_MINUTE);
    }

    // --------------------------------------------------------------------------
    //
    //  Template Methods
    //
    // --------------------------------------------------------------------------

    protected getHtml(text: string): string {
        return `<!DOCTYPE html>
        <html>
            <head>
                <meta charset="utf-8"/>
                <title>OAuth Redirect</title>
            </head>
            <body>
                <p style="text-align: center; padding: 16px;">${text}</p>
            </body>
        </html>`;
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected async load(state: string): Promise<IOAuthPopUpDto> {
        let item = this.map.get(state);
        if (!_.isNil(item)) {
            this.map.delete(state);
        }
        return !_.isNil(item) ? item.data : null;
    }

    protected async save(state: string, data: IOAuthData): Promise<void> {
        this.map.set(state, data);
    }

    protected clear = (): void => {
        this.map.forEach((value, key) => {
            if (value.expired.getTime() < Date.now()) {
                this.map.delete(key);
            }
        })
    }

    // --------------------------------------------------------------------------
    //
    //  Set
    //
    // --------------------------------------------------------------------------

    @Get(OAUTH_URL)
    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { limit: THROTTLE_LIMIT_FAST, ttl: THROTTLE_TTL_FAST } })
    public async saveOAuth(@Query() params: OAuthDto, @Response() response: ExpressResponse): Promise<any> {
        if (this.map.has(params.state)) {
            throw new ExtendedError('State already exists', ErrorCode.REQUEST_INVALID);
        }

        let expired = DateUtil.getDate(Date.now() + 1 * DateUtil.MILLISECONDS_MINUTE);
        await this.save(params.state, { data: OAuthParser.parse(params), expired });

        return response.send(this.getHtml(`Authorization succeed, you can close this window.`));
    }

    // --------------------------------------------------------------------------
    //
    //  Get
    //
    // --------------------------------------------------------------------------

    @Get(`${OAUTH_URL}/:state`)
    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { limit: THROTTLE_LIMIT_FAST, ttl: THROTTLE_TTL_FAST } })
    public async loadOAuth(@Param('state') state: string): Promise<IOAuthPopUpDto> {
        return this.load(state);
    }
}

interface IOAuthData {
    data: IOAuthPopUpDto;
    expired: Date;
}
