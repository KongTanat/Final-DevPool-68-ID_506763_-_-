import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

import bcrypt from 'bcrypt'


@Injectable() //เพื่อทำให้ service สามารถ injectable ที่ controller ได้
export class UsersService {

  constructor(@InjectRepository(User) private readonly repository: Repository<User>) { }  //private เข้าได้แค่ใน class นี้ readonly ไม่ถูกเปลี่ยนแปลงหลัง constructor ทำงานเสร็จ เช่นถ้า create ผิดพลาด findusername จะยังทำได้ต่อ

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10) // 10 จำนวนการสุ่มรหัส 

    const user = {
      ...createUserDto, // spead operator คัดลอก object createdto มา user และแทน hashpassword  ที่ password
      password: hashedPassword
    }
    return this.repository.save(user)
  }

  async findByUsername(username: string) {
    return this.repository.findOneByOrFail({ username }) //ถ้า false จะ undefine or null

  }

  async upsertByKeycloakId(username: string, keycloakId: string): Promise<User> { //เพิ่มข้อมูล  user keycloak ในฐานข้อมูล
    const result = await this.repository.upsert(  //update or insert 
      { username, keycloakId }, //ข้อมูลที่ต้ิงการบันทึก
      {
        conflictPaths: ['keycloakId'], // ถ้าเจอ keyclockid ซ้ำให้ update  ถ้าไม่ซ้ำให้ insert
      },
    );
    console.log('upset', result);

    return this.repository.findOneByOrFail({ keycloakId }); //fail จาการเชื่อมต่อ
  }

}
