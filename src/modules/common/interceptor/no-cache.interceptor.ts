import { CacheInterceptor, ExecutionContext } from '@nestjs/common';
import { IGNORE_CACHE_KEY } from '../decorator/no-cache.decorator';

export class NoCacheInterceptor extends CacheInterceptor {
  protected isRequestCacheable(context: ExecutionContext): boolean {
    const http = context.switchToHttp();
    const request = http.getRequest();
    const ignoreCaching = this.reflector.get(
      IGNORE_CACHE_KEY,
      context.getHandler(),
    );
    if (ignoreCaching) {
      return false;
    }
    if (request.method == 'GET') {
      return true;
    }
  }
}
