import { Logger } from "@ts-core/common";
import { Injectable } from "@nestjs/common";
import { TransportSocketRoomHandler as CoreTransportSocketRoomHandler, TransportSocket } from "@ts-core/socket-server";

@Injectable()
export class TransportSocketRoomHandler extends CoreTransportSocketRoomHandler {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, transport: TransportSocket) {
        super(logger, transport);
    }
}