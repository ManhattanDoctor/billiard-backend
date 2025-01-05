import { WebSocketGateway } from '@nestjs/websockets';
import { Logger } from '@ts-core/common';
import { Socket } from 'socket.io';
import { SOCKET_NAMESPACE } from '@project/common/api/transport'
import { TransportSocketServer as CoreTransportSocketServer } from '@ts-core/socket-server';
import { TransportSocketUserId } from '@ts-core/socket-common';
import { RequestInvalidError } from '@project/module/core/middleware';
import { LoginService } from '@project/module/login/service';
import * as _ from 'lodash';

@WebSocketGateway({ namespace: SOCKET_NAMESPACE, cors: true })
export class TransportSocketServer extends CoreTransportSocketServer {

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private login: LoginService) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected async getClientUserId(client: Socket): Promise<TransportSocketUserId> {
        let { token } = client.handshake.auth;
        if (_.isNil(token)) {
            throw new RequestInvalidError({ name: 'token', value: token, expected: 'not nil' });
        }
        let { id } = await this.login.jwtUserGet(token);
        return id;
    }
}