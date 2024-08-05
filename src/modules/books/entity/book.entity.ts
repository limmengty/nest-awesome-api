import { Column, Entity, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjsx/crud/lib/crud';
import { UserEntity } from '../../user/entity/user.entity'; //import like this is necessary for fixture generate
import { CommonEntity } from '../../common/entity/common';

@Entity({ name: 'books' })
export class BookEntity extends CommonEntity {
  @ApiProperty()
  @Column()
  title: string;

  @ApiProperty()
  @Column()
  dateOfPublished: string;

  @ManyToOne(() => UserEntity, (user) => user.books, { nullable: true })
  byUser: string;

  @ApiProperty()
  @Column({ nullable: true })
  category: string;

  @ApiProperty()
  @Column({ nullable: true })
  isbn: string;

  @ApiProperty()
  @Column({ nullable: true })
  doi: string;
}
