import {
  Controller,
  Body,
  Post,
  Get,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { UsersService } from '../user';
import { Public } from '../common/decorator/public.decorator';
import { AuthService } from './auth.service';
import { LoginPayload } from './payloads/login.payload';
import { ResetPayload } from './payloads/reset.payload';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { GoogleOAuthGuard } from '../common/guard/google.oauth.guard';
import { ProviderEnum } from '../common/enum/provider.enum';
import { JwtAuthGuard } from '../common/guard/jwt.guard';
import RequestWithUser from '../common/interface/request-with-user.interface';
import { NoCache } from '../common/decorator/no-cache.decorator';
import { GithubOAuthGuard } from '../common/guard/github.oauth.guard';
import { FacebookGuard } from '../common/guard/facebook.guard';
import { RegisterEmailPayload } from './payloads/register-email.payload';
import { I18n, I18nContext } from 'nestjs-i18n';

@Controller('api/v1/auth')
@ApiTags('Auth')
export class AuthController {
  /**
   * Constructor
   * @param authService auth service
   * @param userService user service
   */
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  /**
  //  * Login User
  //  * @param payload username, password
  //  * @return { token } including expire time, jwt token and user info
  //  */
  @NoCache()
  @Public()
  @Post('login')
  @ApiResponse({ status: 201, description: 'Successful Login' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Body() payload: LoginPayload): Promise<any> {
    const user = await this.authService.validateUser(payload);
    const tokens = await this.authService.getTokens(user.id);
    await this.authService.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  @NoCache()
  @Public()
  @Get('login-google')
  loginGoogle(@Res() response: Response): any {
    const client_id = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const google_callback = this.configService.get<string>('GOOGLE_CALLBACK');
    const uri = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${client_id}&redirect_uri=${google_callback}&response_type=code&scope=profile email`;
    response.redirect(uri);
  }
  @NoCache()
  @Public()
  @Get('login-github')
  loginGithub(@Res() response: Response): any {
    const client_id = this.configService.get<string>('GITHUB_CLIENT_ID');
    const github_callback = this.configService.get<string>(
      'GITHUB_CALLBACK_URL',
    );
    const uri = `https://github.com/login/oauth/authorize?client_id=${client_id}&redirect_uri=${github_callback}&response_type=code&scope=public_profile`;
    response.redirect(uri);
  }

  @NoCache()
  @Public()
  @Get('login-facebook')
  facebookGithub(@Res() response: Response): any {
    const client_id = this.configService.get<string>('FACEBOOK_APP_ID');
    const facebook_callback = this.configService.get<string>(
      'FACEBOOK_CALLBACK_URL',
    );
    const uri = `https://www.facebook.com/v20.0/dialog/oauth?${client_id}&redirect_uri=${facebook_callback}&auth_type=rerequest&scope=email`;
    response.redirect(uri);
  }

  // @Public()
  // // @UseGuards(GoogleOAuthGuard)
  // @Get('google/callback')
  // async googleCallback(@Req() request): Promise<any> {
  //   // Request
  //   // request.user
  //   const { code } = request.query;
  //   return this.authService.registerGoogleUser(code);
  //   // return request.user;
  // }

  @NoCache()
  @Public()
  @UseGuards(GoogleOAuthGuard)
  @Get('google/callback')
  async googleCallback(@Req() req): Promise<any> {
    return this.authService.handleAuthCallback(
      req,
      ProviderEnum.GOOGLE,
      'firstname',
    );
  }

  @NoCache()
  @Public()
  @UseGuards(GithubOAuthGuard)
  @Get('github/callback')
  async githubCallback(@Req() req): Promise<any> {
    return this.authService.handleAuthCallback(req, ProviderEnum.GITHUB);
  }

  @NoCache()
  @Public()
  @UseGuards(FacebookGuard)
  @Get('facebook/callback')
  async facebookCallback(@Req() req): Promise<any> {
    return this.authService.handleAuthCallback(
      req,
      ProviderEnum.FACEBOOK,
      'fristname',
    );
  }

  /**
   * Change user password
   * @param payload change password payload
   */
  @Public()
  @NoCache()
  @Post('changePassword')
  @ApiResponse({ status: 201, description: 'Successful Reset' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async resetPassword(@Body() payload: ResetPayload): Promise<any> {
    const user = await this.userService.changPassword(payload);
    return user.toJSON();
  }

  // /**
  //  * Register user
  //  * @param payload register payload
  //  */
  // @NoCache()
  // @ApiBearerAuth()
  // @Public()
  // @Post('register')
  // @ApiResponse({ status: 201, description: 'Successful Registration' })
  // @ApiResponse({ status: 400, description: 'Bad Request' })
  // @ApiResponse({ status: 401, description: 'Unauthorized' })
  // async register(@Body() payload: RegisterPayload): Promise<any> {
  //   return await this.userService.create(payload);
  // }

  @Public()
  @Post('/register')
  @ApiOperation({ summary: 'Register a user and send mail verification' })
  @ApiForbiddenResponse({
    status: 403,
    description: 'Forbidden',
    // type: ForbiddenDto,
  })
  async registerUser(
    @Body() payload: RegisterEmailPayload,
    @I18n() i18n: I18nContext,
  ) {
    return this.authService.register(payload, i18n);
  }

  /**
   * Get request's user info
   * @param request express request
   */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @NoCache()
  @Get('me')
  @ApiOkResponse({ description: 'Successful Response' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getLoggedInUser(@Req() req: RequestWithUser): Promise<any> {
    return req.user;
  }
}
