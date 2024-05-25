import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class RegisterPayload {
  @ApiProperty({
    required: true,
    example: 'mengty',
  })
  @IsNotEmpty()
  public username: string;

  @ApiProperty({
    required: true,
  })
  @IsEmail()
  email: string;
}
