import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";

import { Server } from "http";

@WebSocketGateway()
export class EventGateway {
    @WebSocketServer()
    server: Server;
    
    @SubscribeMessage('test')
    create(@MessageBody() createUserDto: any, @ConnectedSocket() socket: any,) {
        console.log('socket', socket.id);
        this.server.emit('message', 'socket connected successfully!');
        console.log(createUserDto);
    }
    
}