import { AuthGuard } from '@nestjs/passport';

export class GithubOAuthGuard extends AuthGuard('github') {}
