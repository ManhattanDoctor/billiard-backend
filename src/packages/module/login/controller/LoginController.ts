import { ILoginDto, ILoginDtoResponse, LoginData } from '@project/common/api/login';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DefaultController } from '@ts-core/backend';
import { Logger } from '@ts-core/common';
import { TraceUtil } from '@ts-core/common';
import { IsEnum, IsDefined, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { LOGIN_URL } from '@project/common/api';
import { LoginResource } from '@project/common/api/login';
import { LoginService } from '../service';
import { Swagger } from '@project/module/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { THROTTLE_LIMIT_FAST, THROTTLE_TTL_FAST } from '@project/module/guard';

// --------------------------------------------------------------------------
//
//  Dto
//
// --------------------------------------------------------------------------

export class LoginDto implements ILoginDto {
    @ApiProperty()
    @IsEnum(LoginResource)
    public resource: LoginResource;

    @ApiProperty()
    @IsDefined()
    public data: LoginData;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    traceId?: string;
}

export class LoginDtoResponse implements ILoginDtoResponse {
    @ApiProperty()
    @IsNotEmpty()
    public sid: string;

    @ApiProperty()
    @IsNotEmpty()
    public token: string;
}

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

@Controller(LOGIN_URL)
export class LoginController extends DefaultController<ILoginDto, ILoginDtoResponse> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private service: LoginService) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    @Swagger({ name: 'Login user', response: LoginDtoResponse })
    @Post()
    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { limit: THROTTLE_LIMIT_FAST, ttl: THROTTLE_TTL_FAST } })
    public async execute(@Body() params: LoginDto): Promise<ILoginDtoResponse> {
        return this.service.login(TraceUtil.addIfNeed(params));
    }
}
