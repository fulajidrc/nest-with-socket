import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { v4 as uuid } from 'uuid';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import jwt, { Secret, JwtPayload } from 'jsonwebtoken';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async login(loginUserDto:LoginUserDto){
    const user = await this.userModel.findOne({email: loginUserDto.email})
    if(user){
      const isMatch = await bcrypt.compare(loginUserDto.password, user.password);
      if(!isMatch)
        return false;
      const payload = { email: user.email, _id: user._id, name: user.name };

      const token = jwt.sign(payload, '123456');
      // const accessToken = await this.jwtService.signAsync(payload)
      return {...user, accessToken: token}
    }else{
      return false;
    }
  }
  async create(createUserDto: CreateUserDto) {
   return await this.userModel.create(createUserDto);
  }

  async findAll() {
    return await this.userModel.find({}, '-password').exec();
  }

  async findOne(id: string) {
    return await this.userModel.findById(id, '-password').exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return await this.userModel.findByIdAndUpdate(id, updateUserDto,{new: true})
  }

  async remove(id: string) {
    return await this.userModel.findByIdAndRemove(id);
  }
}
