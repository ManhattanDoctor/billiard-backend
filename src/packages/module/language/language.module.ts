import { DynamicModule } from '@nestjs/common';
import { LoggerModule } from '@ts-core/backend-nestjs';
import { LanguageGetController } from './controller';
import { CacheModule } from '@ts-core/backend-nestjs';
import { LanguageProjects } from '@ts-core/language';
import { LanguageLoadTranslationRawFunction } from '@ts-core/backend-nestjs-language';
import { LanguageProjects as ProjectLanguageProjects } from '@project/common/language';
import { BilliardLanguage } from './BilliardLanguage';
import * as _ from 'lodash';

export class LanguageModule {
    // --------------------------------------------------------------------------
    //
    //  Public Static Methods
    //
    // --------------------------------------------------------------------------

    public static forRoot(path: string): DynamicModule {
        let projects = [
            ...ProjectLanguageProjects,
            /*
            {
                name: BilliardLanguage.NAME,
                locales: ['ru'],
                prefixes: [
                    'Payment.json',
                    'Server.json'
                ]
            }
            */
        ];
        return {
            global: true,
            module: LanguageModule,
            imports: [
                CacheModule,
                LoggerModule,
            ],
            providers: [
                {
                    provide: LanguageProjects,
                    useFactory: async () => {
                        let item = new LanguageProjects(CustomLanguageLoadTranslationRawFunction);
                        await item.load(path, projects);
                        return item;
                    }
                },
                {
                    provide: BilliardLanguage,
                    inject: [LanguageProjects],
                    useFactory: async (language: LanguageProjects) => {
                        return new BilliardLanguage(language);
                    }
                },
            ],
            exports: [BilliardLanguage],
            controllers: [LanguageGetController]
        };
    }
}

function CustomLanguageLoadTranslationRawFunction<T = any>(path: string, project: string, locale: string, prefixes: Array<string>): Promise<T> {
    if (project === BilliardLanguage.NAME) {
        project = ProjectLanguageProjects[0].name;
    }
    return LanguageLoadTranslationRawFunction(path, project, locale, prefixes);
}
