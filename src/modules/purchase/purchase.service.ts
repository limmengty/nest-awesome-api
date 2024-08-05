import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { PurchaseEntity } from './entity/purchase.entity';
import { DiscountPayload } from './payload/discount.payload';
import { DiscountEntity } from './entity/discount.entity';

@Injectable()
export class PurchaseService extends TypeOrmCrudService<PurchaseEntity> {
  constructor(
    @InjectRepository(PurchaseEntity)
    private purchaseRepository: Repository<PurchaseEntity>,
    @InjectRepository(DiscountEntity)
    private discountRepository: Repository<DiscountEntity>,
  ) {
    super(purchaseRepository);
  }
  // async getAllPurchase() {
  //   const result = await this.purchaseRepository.find({
  //     relations: ['books'],
  //   });
  //   console.log(result);
  //   return result;
  // }
  async getAllPurchase() {
    const result = await this.purchaseRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.books', 'b')
      .getMany();
    return result;
  }

  async newDiscount(payload: DiscountPayload & { onPurchase: string }) {
    const discount = await this.discountRepository.save(
      this.discountRepository.create(payload),
    );

    // const purchase = await this.purchaseRepository.findOne(payload.id);

    return discount;
  }

  async getAllDiscount() {
    return await this.discountRepository.find({
      relations: ['onPurchase'],
    });
  }
}
