import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entity/user.entity';
import { UserController } from './user.controller';
import { PassportModule } from '@nestjs/passport';
import { UsersService } from './user.service';
import { UserGateWay } from './user.getway';
import { IntegrationEntity } from './entity/integration.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, IntegrationEntity]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  exports: [UsersService],
  controllers: [UserController],
  providers: [UsersService, UserGateWay],
})
export class UserModule {}
