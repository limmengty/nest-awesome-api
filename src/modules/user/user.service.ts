import {
  BadRequestException,
  Body,
  HttpException,
  HttpStatus,
  Injectable,
  NotAcceptableException,
  Param,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entity/user.entity';
import { Hash } from '../../utils/Hash';
import { UUIDType } from '../common/validator/FindOneUUID.validator';
import { ResetPayload } from '../auth/payloads/reset.payload';
import { UpdatePayload } from './payloads/update.payload';
import { RegisterPayload } from '../auth/payloads/register.payload';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { IntegrationEntity } from './entity/integration.entity';
import { UsersTypeEnum } from '../common/enum/user_type.enum';
import { BookEntity } from '../books/entity/book.entity';
import { BookPayload } from './payloads/book.payload';

@Injectable()
export class UsersService extends TypeOrmCrudService<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(IntegrationEntity)
    private readonly integrationRepository: Repository<IntegrationEntity>,
    @InjectRepository(BookEntity)
    private readonly bookRepository: Repository<BookEntity>,
  ) {
    super(userRepository);
  }

  async get(@Param() id: UUIDType) {
    return this.userRepository.findOne(id);
  }

  async getByUsername(username: string) {
    return await this.userRepository.findOne({ username: username });
  }

  async update(
    @Param() id: UUIDType,
    @Body() updatePayload: UpdatePayload,
  ): Promise<any> {
    const admin = await this.userRepository.findOne(id);
    const updated = Object.assign(admin, updatePayload);
    delete updated.password;
    try {
      return await this.userRepository.save(updated);
    } catch (e) {
      throw new NotAcceptableException('Username or Email already exists!');
    }
  }

  async getAll(): Promise<UserEntity[]> {
    const queryBuilder = await this.userRepository.createQueryBuilder('a');
    queryBuilder.orderBy('a.updatedDate', 'DESC');
    return queryBuilder.execute();
  }

  async changPassword(payload: ResetPayload): Promise<any> {
    const user = await this.getByUsername(payload.username);
    if (!user || !Hash.compare(payload.currentPassword, user.password)) {
      throw new UnauthorizedException('Invalid credentials!');
    }
    await this.userRepository
      .createQueryBuilder('users')
      .update(UserEntity)
      .set({ password: payload.newPassword })
      .where('username =:username', { username: payload.username })
      .execute();
    return user;
  }

  async create(payload: RegisterPayload) {
    const user = await this.getByUsername(payload.username);
    if (user) {
      throw new NotAcceptableException(
        'Admin with provided username already created.',
      );
    }
    return await this.userRepository.save(this.userRepository.create(payload));
  }

  async delete(@Param() id: UUIDType): Promise<any> {
    const user = await this.userRepository.findOne(id);
    const deleted = await this.userRepository.delete(id);
    if (deleted.affected === 1) {
      return { message: `Deleted ${user.username} from records` };
    } else {
      throw new BadRequestException(
        `Failed to delete a profile by the name of ${user.username}.`,
      );
    }
  }

  async getByEmail(email: string) {
    try {
      const user = await this.userRepository.findOne({ email: email });
      if (user) {
        return user;
      }
    } catch (e) {
      throw new HttpException(
        'User with this email does not exist',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async getIntegrationById(id: string): Promise<IntegrationEntity[]> {
    return await this.integrationRepository
      .createQueryBuilder('integration')
      .where('integration.byUserId = :userId', { userId: id })
      .orderBy('integration.created_at')
      .getMany();
  }
  async saveUser(
    payload: RegisterPayload,
    type: UsersTypeEnum,
    picture: string,
  ): Promise<UserEntity> {
    return await this.userRepository.save(
      this.userRepository.create({
        ...payload,
        username: payload.firstname + Date.now().toString(),
        registrationType: type,
        picture: picture,
        // password: hashedPassword,
      }),
    );
  }
  // async saveUser(type: UsersType): Promise<UserEntity> {
  //   return await this.userRepository.save(
  //     this.userRepository.create({
  //       registrationType: type,
  //       // password: hashedPassword,
  //     }),
  //   );
  // }

  // async getBookByUserID(@Param('id') id: string) {
  //   const book = this.bookRepository.find({
  //     where: {
  //       byUser: id,
  //     },
  //   });
  //   return book;
  // }

  async getBookByUserID(id: string) {
    const books = await this.userRepository.find({
      id: id,
    });
    return books;
  }

  async createBookByUserId(payload: BookPayload & { byUser: string }) {
    const newBooks = await this.bookRepository.save(
      this.bookRepository.create(payload),
    );

    const user = await this.userRepository.findOne(payload.byUser);
    console.log(user);
    if (user) {
      // user.books = [];
      user.books.push(newBooks.id);
      await this.userRepository.save(user);
    }

    return newBooks;
  }
}
