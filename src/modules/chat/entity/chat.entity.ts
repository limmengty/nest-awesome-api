import { CommonEntity } from 'src/modules/common/entity/common';
import { UserEntity } from 'src/modules/user';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
@Entity({
  name: 'chats',
})
export class ChatEntity extends CommonEntity {
  @Column({ nullable: false })
  message: string;

  @Column({ nullable: false })
  username: string;

  @Index()
  @ManyToOne(() => UserEntity, (user) => user.chat)
  @JoinColumn({ name: 'byUserId' })
  byUserId: UserEntity;
}
