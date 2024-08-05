import {
  Body,
  CacheTTL,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from './user.service';
import {
  CreateManyDto,
  Crud,
  CrudController,
  CrudRequest,
  Override,
  ParsedBody,
  ParsedRequest,
} from '@nestjsx/crud';
import { UserEntity } from './entity/user.entity';
import { AppRoles } from '../common/enum/roles.enum';
import { Roles } from '../common/decorator/roles.decorator';
import { Public } from '../common/decorator/public.decorator';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NoCache } from '../common/decorator/no-cache.decorator';
import { BookPayload } from './payloads/book.payload';
@Crud({
  model: {
    type: UserEntity,
  },
  query: {
    join: {
      books: {
        eager: true,
      },
    },
  },
})
@Controller('api/v1/user')
@ApiTags('Users')
export class UserController implements CrudController<UserEntity> {
  /**
   * User controller constructor
  //  * @param userService user service
   */
  constructor(
    public service: UsersService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  get base(): CrudController<UserEntity> {
    return this;
  }

  @Roles(AppRoles.ADMINS)
  @ApiBearerAuth()
  @Override()
  async deleteOne(@ParsedRequest() req: CrudRequest) {
    return this.base.deleteOneBase(req);
  }

  // @Roles(AppRoles.ADMINS)
  // @ApiBearerAuth()
  @NoCache()
  @Public()
  @Override('createOneBase')
  async createOne(
    @ParsedRequest() req: CrudRequest,
    @ParsedBody() dto: UserEntity,
  ) {
    const user = this.base.createOneBase(req, dto);
    this.eventEmitter.emit('user.created', user);
    return user;
  }
  @ApiBearerAuth()
  @Override()
  createMany(
    @ParsedRequest() req: CrudRequest,
    @ParsedBody() dto: CreateManyDto<UserEntity>,
  ) {
    return this.base.createManyBase(req, dto);
  }

  @ApiBearerAuth()
  @Override('updateOneBase')
  coolFunction(
    @ParsedRequest() req: CrudRequest,
    @ParsedBody() dto: UserEntity,
  ) {
    return this.base.updateOneBase(req, dto);
  }

  @Public()
  @CacheTTL(60) //spacil case
  @Override('getManyBase')
  async getManyBaseUser(@ParsedRequest() req: CrudRequest) {
    return this.base.getManyBase(req);
  }

  @Public()
  @Override('getOneBase')
  getOneAndDoStuff(@ParsedRequest() req: CrudRequest) {
    return this.base.getOneBase(req);
  }

  @Public()
  @Get(':id/books')
  async getBooks(@Param('id') id: string) {
    return this.service.getBookByUserID(id);
  }
  @Public()
  @Post(':id/books')
  async createBookByUserId(
    @Param('id') id: string,
    @Body() payload: BookPayload,
  ) {
    const newPayload = { byUser: id, ...payload };
    return this.service.createBookByUserId(newPayload);
  }
}
