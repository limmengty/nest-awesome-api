import { Controller } from '@nestjs/common';
import { BookService } from './book.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Crud } from '@nestjsx/crud';
import { BookEntity } from './entity/book.entity';

@Crud({
  model: {
    type: BookEntity,
  },
})
@Controller('books')
@ApiBearerAuth()
@ApiTags('Books')
export class BookController {
  constructor(private readonly bookService: BookService) {}
}
