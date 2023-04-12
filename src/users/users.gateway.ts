import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Server } from 'http';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { Socket } from 'dgram';

const saltOrRounds = 10;
@WebSocketGateway()
export class UsersGateway {
  constructor(private readonly usersService: UsersService) {}

  @WebSocketServer()
  server: Server;


  @SubscribeMessage('loginUser')
  async login(
    @MessageBody() loginUserDto: LoginUserDto, 
    @ConnectedSocket() socket: Socket,) {
    const user = await this.usersService.login(loginUserDto);
    if(user){
      this.sendResponse('DELETE_USER2', {test:'test', newData:"testtest"})
      //this.server.emit('message',{type: 'test', test:'test sms'});
      socket.emit('message', {
        type: 'SUCCESS_LOGIN',
        data: user
      });
    }
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

  sendResponseTo(type, data){
    this.server.emit('message',{
      type,
      data
    })
  }
}
