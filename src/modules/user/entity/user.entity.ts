import { Entity, Column, OneToMany } from 'typeorm';
import { PasswordTransformer } from '../password.transformer';
import { AppRoles } from '../../common/enum/roles.enum';
import { UsersTypeEnum } from 'src/modules/common/enum/user_type.enum';
import { IntegrationEntity } from './integration.entity';
import { CommonEntity } from 'src/modules/common/entity/common';
import { ChatEntity } from '../../chat/entity/chat.entity';

@Entity({
  name: 'users',
})
export class UserEntity extends CommonEntity {
  /**
   * Unique username column
   */
  @Column({ length: 255, unique: true })
  username: string;

  /**
   * FirstName column
   */
  @Column({ length: 255 })
  firstname: string;

  /**
   * LastName column
   */
  @Column({ length: 255, nullable: true })
  lastname: string;

  /**
   * Email colum
   */
  @Column({ type: 'text', unique: true })
  email: string;

  @Column({
    type: 'simple-array',
    enum: AppRoles,
    default: AppRoles.DEFAULT,
  })
  roles: AppRoles[];

  /**
   * Password column
   */
  @Column({
    name: 'password',
    length: 255,
    transformer: new PasswordTransformer(),
  })
  password: string;

  /**
   * User registration type: email, Facebook, Google, or GitHub
   */
  @Column({
    type: 'enum',
    enum: UsersTypeEnum,
    default: UsersTypeEnum.PASSWORD,
  })
  registrationType: string;

  @OneToMany(() => IntegrationEntity, (integration) => integration.byUser)
  integration: IntegrationEntity[];

  @OneToMany(() => ChatEntity, (chat) => chat.byUser)
  chat: ChatEntity[];

  @Column({ type: 'text', nullable: true })
  picture: string;
  /**
   * Refresh Token
   */
  @Column({
    nullable: true,
  })
  // @Exclude()
  public refreshToken?: string;
  /**
   * Omit password from query selection
   */
  toJSON() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, refreshToken, ...self } = this;
    return self;
  }
}
