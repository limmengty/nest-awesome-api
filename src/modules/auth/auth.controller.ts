import {
  Controller,
  Body,
  Post,
  Get,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from '../user';
import { Public } from '../common/decorator/public.decorator';
import { AuthService } from './auth.service';
import { LoginPayload } from './payloads/login.payload';
import { ResetPayload } from './payloads/reset.payload';
import { RegisterPayload } from './payloads/register.payload';
import { ConfigService } from '@nestjs/config';

import { Request, Response } from 'express';
import { GoogleOAuthGuard } from '../common/guard/google.oauth.guard';
import { ProviderEnum } from '../common/enum/provider.enum';
import { JwtAuthGuard } from '../common/guard/jwt.guard';

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
    return await this.authService.createToken(user);
  }

  @Public()
  @Get('login-google')
  loginGoogle(@Res() response: Response): any {
    const client_id = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const google_callback = this.configService.get<string>('GOOGLE_CALLBACK');
    const uri = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${client_id}&redirect_uri=${google_callback}&response_type=code&scope=profile email`;
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
    return this.authService.handleAuthCallback(req, ProviderEnum.GOOGLE);
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
  // @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiResponse({ status: 200, description: 'Successful Response' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getLoggedInUser(@Req() request): Promise<any> {
    return await this.userService.getByUsername(request.user.username);
  }
}
