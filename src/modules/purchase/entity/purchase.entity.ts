import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
} from 'typeorm';
import { ApiProperty } from '@nestjsx/crud/lib/crud';
import { UserEntity } from '../../user/entity/user.entity'; //import like this is necessary for fixture generate
import { CommonEntity } from '../../common/entity/common';
import { BookEntity } from 'src/modules/books/entity/book.entity';

@Entity({ name: 'purchases' })
export class PurchaseEntity extends CommonEntity {
  @ApiProperty()
  @Column({ type: 'money' })
  price: number;

  @ManyToMany(() => BookEntity)
  @JoinTable()
  books: string[];
}
