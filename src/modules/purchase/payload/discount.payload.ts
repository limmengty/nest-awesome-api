import { ApiProperty } from '@nestjs/swagger';

export class DiscountPayload {
  @ApiProperty({
    required: true,
    example: '111',
  })
  price: number;

  // @ApiProperty({
  //   required: true,
  //   example: 'uuid',
  // })
  // purchase: string;
}
