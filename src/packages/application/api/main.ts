import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DateUtil } from '@ts-core/common';
import { DefaultLogger } from '@ts-core/backend-nestjs';
import { AllErrorFilter, ValidationExceptionFilter, HttpExceptionFilter, ExtendedErrorFilter } from '@ts-core/backend-nestjs';
import { CoreExtendedErrorFilter } from '@project/module/core/middleware';
import { AppModule, AppSettings } from './src';
import * as compression from 'compression';
import * as nocache from 'nocache';
import helmet from 'helmet';
import * as _ from 'lodash';

// --------------------------------------------------------------------------
//
//  Bootstrap
//
// --------------------------------------------------------------------------

async function bootstrap(): Promise<void> {
    let settings = new AppSettings();
    let logger = (settings.logger = new DefaultLogger(settings.loggerLevel));

    let application = await NestFactory.create(AppModule.forRoot(settings), { logger });
    application.useLogger(logger);
    application.use(helmet());
    application.use(nocache());
    application.use(compression());
    application.enableCors({ origin: true });
    application.useGlobalPipes(new ValidationPipe({ transform: true }));
    application.useGlobalFilters(new AllErrorFilter(new ValidationExceptionFilter(), new CoreExtendedErrorFilter(), new ExtendedErrorFilter(), new HttpExceptionFilter()));

    const server = application.getHttpServer();
    server.setTimeout(10 * DateUtil.MILLISECONDS_MINUTE);

    await application.listen(settings.webPort);
    logger.log(`Listening "${settings.webPort}" port`);
}

bootstrap();
