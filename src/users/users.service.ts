import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

import bcrypt from 'bcrypt'


@Injectable()
export class UsersService {

  constructor(@InjectRepository(User) private readonly repository: Repository<User>) { }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10) // 10 จำนวนการสุ่มรหัส 

    const user = {
      ...createUserDto, // spead operator คัดลอก object createdto มา user และแทน hashpassword  ที่ password
      password: hashedPassword
    }
    return this.repository.save(user)
  }

  async findByUsername(username: string) {
    return this.repository.findOneByOrFail({ username })

  }

  async upsertByKeycloakId(username: string, keycloakId: string): Promise<User> {
    const result = await this.repository.upsert(
      { username, keycloakId },
      {
        conflictPaths: ['keycloakId'],
      },
    );
    console.log('upset', result);

    return this.repository.findOneByOrFail({ keycloakId });
  }

}
