import { Injectable } from '@nestjs/common';
import { Logger } from "@ts-core/common";
import { TransportSocket as CoreTransportSocket } from '@ts-core/socket-server';
import { TransportSocketServer } from "./TransportSocketServer";

@Injectable()
export class TransportSocketImpl extends CoreTransportSocket {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, socket: TransportSocketServer) {
        super(logger, {}, socket);
    }
}