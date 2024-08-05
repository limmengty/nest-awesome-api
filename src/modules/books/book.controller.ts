import {
  Controller,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { BookService } from './book.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import {
  CreateManyDto,
  Crud,
  CrudController,
  CrudRequest,
  Override,
  ParsedBody,
  ParsedRequest,
} from '@nestjsx/crud';
import { BookEntity } from './entity/book.entity';
import { AppRoles } from '../common/enum/roles.enum';
import { Roles } from '../common/decorator/roles.decorator';
import { Public } from '../common/decorator/public.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';

@Crud({
  model: {
    type: BookEntity,
  },
})
@Controller('api/v1/books')
@ApiTags('Books')
export class BookController implements CrudController<BookEntity> {
  constructor(public service: BookService) {}

  get base(): CrudController<BookEntity> {
    return this;
  }

  @Roles(AppRoles.ADMINS)
  @ApiBearerAuth()
  @Override()
  async deleteOne(@ParsedRequest() req: CrudRequest) {
    return this.base.deleteOneBase(req);
  }

  @ApiBearerAuth()
  @Override()
  createOne(@ParsedRequest() req: CrudRequest, @ParsedBody() dto: BookEntity) {
    return this.base.createOneBase(req, dto);
  }

  @ApiBearerAuth()
  @Override()
  createMany(
    @ParsedRequest() req: CrudRequest,
    @ParsedBody() dto: CreateManyDto<BookEntity>,
  ) {
    return this.base.createManyBase(req, dto);
  }

  @ApiBearerAuth()
  @Override('updateOneBase')
  coolFunction(
    @ParsedRequest() req: CrudRequest,
    @ParsedBody() dto: BookEntity,
  ) {
    return this.base.updateOneBase(req, dto);
  }

  @Public()
  @Override('getManyBase')
  async getManyBaseUser(@ParsedRequest() req: CrudRequest) {
    return this.base.getManyBase(req);
  }

  @Public()
  @Override('getOneBase')
  getOneAndDoStuff(@ParsedRequest() req: CrudRequest) {
    return this.base.getOneBase(req);
  }

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Post('upload')
  @Public()
  @UseInterceptors(
    FileInterceptor('file', {
      dest: './upload',
    }),
  )
  updloadFile(@UploadedFile() file: Express.Multer.File) {
    // upload logic
    console.log(file);
  }
}
