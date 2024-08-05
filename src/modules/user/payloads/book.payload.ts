import { ApiProperty } from '@nestjs/swagger';

export class BookPayload {
  @ApiProperty({
    required: true,
    example: 'c++',
  })
  title: string;
  @ApiProperty({
    required: true,
    example: '2024-06-30T06:46:28.244Z',
  })
  dateOfPublished: string;
  @ApiProperty({
    required: true,
    example: 'book',
  })
  category: string;
}
