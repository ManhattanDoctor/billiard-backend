import { LanguageProjectProxy, LanguageProjects } from "@ts-core/language";

export class BilliardLanguage extends LanguageProjectProxy {

    // --------------------------------------------------------------------------
    //
    //  Constants
    //
    // --------------------------------------------------------------------------

    public static NAME = 'BILLIARD_SERVER';

    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    constructor(projects: LanguageProjects) {
        super(BilliardLanguage.NAME, projects);
    }
}