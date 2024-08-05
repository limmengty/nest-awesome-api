import { CommonEntity } from '../../common/entity/common';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { PurchaseEntity } from './purchase.entity';

@Entity({ name: 'discounts' })
export class DiscountEntity extends CommonEntity {
  @Column({ type: 'money' })
  price: number;

  @OneToOne(() => PurchaseEntity)
  @JoinColumn()
  onPurchase: string;
}
