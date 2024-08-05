import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { CommonEntity } from '../../common/entity/common';
import { UserEntity } from '../../user/entity/user.entity';
@Entity({
  name: 'chats',
})
export class ChatEntity extends CommonEntity {
  @Column({ nullable: false })
  message: string;

  @Column({ nullable: false })
  username: string;

  @Index()
  @ManyToOne(() => UserEntity, (user) => user.chat, { nullable: true })
  @JoinColumn({ name: 'byUserId' })
  byUserId: UserEntity;
}
