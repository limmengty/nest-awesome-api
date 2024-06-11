import { ApiProperty } from '@nestjsx/crud/lib/crud';

export class UserPayload {
  @ApiProperty({
    required: true,
    uniqueItems: true,
    example: 'mengty',
  })
  username: string;
  firstname: string;
  lastname: string;
  @ApiProperty({
    required: true,
    uniqueItems: true,
    example: '@gmail.com',
  })
  email: string;
  @ApiProperty({
    required: true,
    uniqueItems: true,
    example: '11111111',
  })
  password: string;
}
