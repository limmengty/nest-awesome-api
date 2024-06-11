import { CacheTTL, Controller, Get } from '@nestjs/common';
import { ChatEntity } from './entity/chat.entity';
import {
  Crud,
  CrudController,
  CrudRequest,
  Override,
  ParsedRequest,
} from '@nestjsx/crud';
import { ChatService } from './chat.service';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorator/public.decorator';
import { NoCache } from '../common/decorator/no-cache.decorator';
import { UserEntity } from '../user';

@Crud({
  model: {
    type: ChatEntity,
  },
})
@Controller('api/v1/chats')
@ApiTags('chats')
export class ChatController implements CrudController<ChatEntity> {
  constructor(public service: ChatService) {}

  get base(): CrudController<ChatEntity> {
    return this;
  }

  @Public()
  // @CacheTTL(3600) //spacil case
  @NoCache()
  @Override('getManyBase')
  async getManyBaseUser(@ParsedRequest() req: CrudRequest) {
    return this.base.getManyBase(req);
  }

  @Get('user')
  async getUsersWithMessages(): Promise<UserEntity[]> {
    return this.service.findAllUsersWithMessages();
  }
}
