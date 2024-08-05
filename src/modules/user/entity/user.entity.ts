import { Entity, Column, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { PasswordTransformer } from '../password.transformer';
import { AppRoles } from '../../common/enum/roles.enum';
import { UsersTypeEnum } from '../../common/enum/user_type.enum';
import { ApiProperty } from '@nestjsx/crud/lib/crud';
import { CommonEntity } from '../../common/entity/common';
import { IntegrationEntity } from './integration.entity';
import { ChatEntity } from '../../chat/entity/chat.entity';
import { BookEntity } from '../../books/entity/book.entity';
import { DiscountEntity } from '../../purchase/entity/discount.entity';

@Entity({
  name: 'users',
})
export class UserEntity extends CommonEntity {
  /**
   * Unique username column
   */
  @ApiProperty({
    required: true,
    uniqueItems: true,
    example: 'mengty',
  })
  @Column({ length: 255, unique: true })
  username: string;

  /**
   * FirstName column
   */
  @ApiProperty()
  @Column({ length: 255 })
  firstname: string;

  /**
   * LastName column
   */
  @ApiProperty()
  @Column({ length: 255, nullable: true })
  lastname: string;

  /**
   * Email colum
   */
  @ApiProperty({
    required: true,
    uniqueItems: true,
    example: '@gmail.com',
  })
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
  @ApiProperty({
    required: true,
    uniqueItems: true,
    example: '11111111',
  })
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

  @OneToMany(() => ChatEntity, (chat) => chat.byUserId)
  chat: ChatEntity[];

  @OneToMany(() => BookEntity, (chat) => chat.byUser, {
    nullable: false,
    eager: true,
  })
  books: string[];

  @OneToOne(() => DiscountEntity)
  @JoinColumn() // for owner
  byUser: string;

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
