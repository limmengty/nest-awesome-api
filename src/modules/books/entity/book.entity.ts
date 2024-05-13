import { Column, Entity } from 'typeorm';
import { ApiProperty } from '@nestjsx/crud/lib/crud';
import { CommonEntity } from 'src/modules/common/entity/common';

@Entity({ name: 'books' })
export class BookEntity extends CommonEntity {
  @ApiProperty()
  @Column()
  title: string;

  @ApiProperty()
  @Column()
  dateOfPublished: string;

  @ApiProperty()
  @Column({ nullable: true })
  author: string;

  @ApiProperty()
  @Column({ nullable: true })
  category: string;
}
