import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { Req, Res, UseGuards } from '@nestjs/common';
import * as cookie from 'cookie';
import { Server, Socket } from 'socket.io';
import { WsGuard } from 'src/ws-guard';

const saltOrRounds = 10;
@WebSocketGateway()
export class UsersGateway {
  constructor(private readonly usersService: UsersService) {}

  @WebSocketServer()
  server: Server;


  @SubscribeMessage('loginUser')
  async login(
    @MessageBody() loginUserDto: LoginUserDto, 
    @ConnectedSocket() socket: Socket,@Res({ passthrough: true }) res) {
    const user = await this.usersService.login(loginUserDto);
    if(user){
      const token = user.accessToken;
      const cookieOptions = {
        httpOnly: false,
        secure: false,
        maxAge: 30 * 12 * 3600 // cookie expires in 1 hour
      };
      const cookieValue = cookie.serialize('myToken2', token, cookieOptions);
      console.log('cookieValue',cookieValue);
      socket.emit('cookie', token);
      // Wait for the 'cookieReceived' event to be emitted by the client
      await new Promise<void>((resolve) => {
        socket.on('cookieReceived', () => {
          console.log('cookie recived');
          resolve();
        });
      });
      socket.emit('message', {
        type: 'SUCCESS_LOGIN',
        data: user
      });
    }
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('verifyCookie')
  async verifyCookie(@ConnectedSocket() socket: Socket,@MessageBody() loginUserDto: any, ){
    console.log('loginUserDto', loginUserDto);
    // const cookieValue = socket.handshake.headers.cookie;
    // const cookieOptions = {}; // add any cookie options as needed
    // const cookies = cookie.parse(cookieValue, cookieOptions);
    // const token = cookies.myToken; // replace 'myToken' with your cookie key
  }

  @SubscribeMessage('createUser')
  async create(@MessageBody() createUserDto: CreateUserDto) {
    const hash = await bcrypt.hash(createUserDto.password, saltOrRounds);
    const user = await this.usersService.create({...createUserDto, password: hash});
    this.sendResponse('ADD_USER', user)

  }

  @SubscribeMessage('findAllUsers')
  async findAll() {
    const users = await this.usersService.findAll();
    console.log('users',users);
    this.sendResponse('USERS', users)
  }

  @SubscribeMessage('findOneUser')
  async findOne(@MessageBody() id: string) {
    return await this.usersService.findOne(id);
  }

  @SubscribeMessage('updateUser')
  async update(@MessageBody() updateUserDto: UpdateUserDto) {
    if(updateUserDto.password && updateUserDto.password.trim() != ''){
      const hash = await bcrypt.hash(updateUserDto.password, saltOrRounds);
      updateUserDto.password = hash
    }else{
      delete updateUserDto.password;
    }
    const user = await this.usersService.update(updateUserDto._id, updateUserDto);
    this.sendResponse('UPDATE_USER', user)
  }

  @SubscribeMessage('removeUser')
  async remove(@MessageBody() id: string) {
    const userId = await this.usersService.remove(id); 
    this.sendResponse('DELETE_USER', userId)
  }

  sendResponse(type, data){
    this.server.emit('message',{
      type,
      data
    })
  }
}
