import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiBasicAuth, ApiTags } from '@nestjs/swagger';
import { Crud, CrudController } from '@nestjsx/crud';
import { Public } from '../common/decorator/public.decorator';
import { PurchaseEntity } from './entity/purchase.entity';
import { PurchaseService } from './purchase.service';
import { DiscountPayload } from './payload/discount.payload';

@Crud({
  model: {
    type: PurchaseEntity,
  },
})
@Controller('api/v1/purchases')
@ApiTags('Purchases')
@Public()
@ApiBasicAuth()
export class PurchaseController implements CrudController<PurchaseEntity> {
  constructor(public service: PurchaseService) {}

  get base(): CrudController<PurchaseEntity> {
    return this;
  }
  // @Public()
  @Get('all-books')
  async getPurchase(): Promise<any> {
    return await this.service.getAllPurchase();
  }

  @Post(':id/discount')
  async newDiscount(
    @Body() payload: DiscountPayload,
    @Param('id', new ParseUUIDPipe()) onPurchase: string,
  ): Promise<any> {
    return await this.service.newDiscount({ onPurchase, ...payload });
  }

  @Get('discounts')
  async getAllDiscount(): Promise<any> {
    return this.service.getAllDiscount();
  }
}
