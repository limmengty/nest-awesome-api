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
} from '@nestjs/swagger';
import { UsersService } from '../user';
import { Public } from '../common/decorator/public.decorator';
import { AuthService } from './auth.service';
import { LoginPayload } from './payloads/login.payload';
import { ResetPayload } from './payloads/reset.payload';
import { RegisterPayload } from './payloads/register.payload';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { GoogleOAuthGuard } from '../common/guard/google.oauth.guard';
import { ProviderEnum } from '../common/enum/provider.enum';
import { JwtAuthGuard } from '../common/guard/jwt.guard';
import RequestWithUser from '../common/interface/request-with-user.interface';
import { NoCache } from '../common/decorator/no-cache.decorator';
import { GithubOAuthGuard } from '../common/guard/github.oauth.guard';
import { FacebookGuard } from '../common/guard/facebook.guard';

@Controller('api/v1/auth')
@ApiTags('Authentication')
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
  //  * @return {token} including expire time, jwt token and user info
  //  */
  @Public()
  @Post('login')
  @ApiResponse({ status: 201, description: 'Successful Login' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Body() payload: LoginPayload): Promise<any> {
    const user = await this.authService.validateUser(payload);
    const tokens = await this.authService.getTokens(user.id);
    return await this.authService.updateRefreshToken(
      user.id,
      tokens.refreshToken,
    );
  }

  @Public()
  @Get('login-google')
  loginGoogle(@Res() response: Response): any {
    const client_id = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const google_callback = this.configService.get<string>('GOOGLE_CALLBACK');
    const uri = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${client_id}&redirect_uri=${google_callback}&response_type=code&scope=profile email`;
    response.redirect(uri);
  }
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

  @Public()
  @Get('login-facebook')
  facebookGithub(@Res() response: Response): any {
    const client_id = this.configService.get<string>('FACEBOOK_APP_ID');
    const facebook_callback = this.configService.get<string>(
      'FACEBOOK_CALLBACK_URL',
    );
    const uri = `https://www.facebook.com/v4.0/dialog/oauth?${client_id}&redirect_uri=${facebook_callback}&response_type=code&scope=email&auth_type=rerequest&display=popup`;
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
  @Public()
  @UseGuards(GithubOAuthGuard)
  @Get('github/callback')
  async githubCallback(@Req() req): Promise<any> {
    return this.authService.handleAuthCallback(req, ProviderEnum.GITHUB);
  }

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
  @Post('changePassword')
  @ApiResponse({ status: 201, description: 'Successful Reset' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async resetPassword(@Body() payload: ResetPayload): Promise<any> {
    const user = await this.userService.changPassword(payload);
    return user.toJSON();
  }

  /**
   * Register user
   * @param payload register payload
   */
  @ApiBearerAuth()
  @Post('register')
  @ApiResponse({ status: 201, description: 'Successful Registration' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async register(@Body() payload: RegisterPayload): Promise<any> {
    return await this.userService.create(payload);
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
