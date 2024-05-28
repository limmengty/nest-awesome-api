import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';

export class LoginPayload {
  @ApiProperty({
    example: 'user',
    required: true,
  })
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    example: 'admin',
    required: true,
  })
  @IsNotEmpty()
  @MinLength(5)
  password: string;
}
