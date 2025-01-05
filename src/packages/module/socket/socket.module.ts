import { Module, Global } from '@nestjs/common';
import { DatabaseModule } from '@project/module/database';
import { SharedModule } from '@project/module/shared';
import { TransportSocket } from '@ts-core/socket-server';
import { TransportSocketServer, TransportSocketImpl } from './service';
import { LoginModule } from '@project/module/login';
import { TransportSocketRoomHandler } from './handler';

let providers = [
    TransportSocketImpl,
    {
        provide: TransportSocket,
        useExisting: TransportSocketImpl,
    },
    TransportSocketServer,
    TransportSocketRoomHandler
];

@Global()
@Module({
    imports: [SharedModule, DatabaseModule, LoginModule],
    exports: [TransportSocket],
    providers
})
export class SocketModule { }