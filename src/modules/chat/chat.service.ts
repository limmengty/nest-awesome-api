import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatEntity } from './entity/chat.entity';
import { Repository } from 'typeorm';
import { UserEntity } from '../user';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';

@Injectable()
export class ChatService extends TypeOrmCrudService<ChatEntity> {
  constructor(
    @InjectRepository(ChatEntity)
    private chatRepository: Repository<ChatEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {
    super(chatRepository);
  }
  async getChatById(id: string): Promise<ChatEntity[]> {
    return await this.chatRepository
      .createQueryBuilder('chat')
      .where('chat.byUserId = :userId', { userId: id })
      .orderBy('chat.created_at')
      .getMany();
  }
  async getOneById(userId: string) {
    const user = await this.userRepository.findOne({
      id: userId,
    });
    return user;
  }
  async getOneByUsername(username: string) {
    const user = await this.userRepository.findOne({
      username: username,
    });
    return user;
  }
  async create(
    createMessaage: ChatEntity,
    userId: string,
  ): Promise<ChatEntity> {
    const user = await this.userRepository.findOne(userId);
    console.log('userid', user);
    return await this.chatRepository.save(
      this.chatRepository.create({
        ...createMessaage,
        byUserId: user,
      }),
    );
  }

  async findAllUsersWithMessages(): Promise<UserEntity[]> {
    return this.userRepository.find({ relations: ['chat'] });
  }
}
