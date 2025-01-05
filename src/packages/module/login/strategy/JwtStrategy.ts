import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { LoginService } from '../service';
import { UserEntity } from '@project/module/database/user';

export class JwtStrategy extends PassportStrategy(Strategy) {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(settings: IJwtStrategySettings, private service: LoginService) {
        super({ jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), secretOrKey: settings.jwtSecret });
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async validate(item: IJwtUser, done: (error: Error, user: UserEntity) => any): Promise<any> {
        try {
            done(null, await this.service.userGet(item));
        } catch (error) {
            return done(error, null);
        }
    }
}

export interface IJwtUser {
    id: number;
    login: string;
}

export interface IJwtStrategySettings {
    readonly jwtSecret: string;
    readonly jwtExpiresTimeout: number;
}

