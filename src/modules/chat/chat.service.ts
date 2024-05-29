import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatEntity } from './entity/chat.entity';
import { Repository } from 'typeorm';
import { UserEntity } from '../user';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatEntity)
    private readonly chatRepository: Repository<ChatEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}
  async getChatById(id: string): Promise<ChatEntity[]> {
    return await this.chatRepository
      .createQueryBuilder('chat')
      .where('chat.byUserId = :userId', { userId: id })
      .orderBy('chat.created_at')
      .getMany();
  }
  async getOne(userId: string) {
    const user = await this.userRepository.findOne({
      id: userId,
    });
    return user;
  }
  async create(
    createMessaage: ChatEntity,
    userId: string,
  ): Promise<ChatEntity> {
    const user = await this.getOne(userId);
    console.log(user);
    return await this.chatRepository.save(
      this.chatRepository.create({
        ...createMessaage,
        byUser: user.id,
      }),
    );
  }
}
