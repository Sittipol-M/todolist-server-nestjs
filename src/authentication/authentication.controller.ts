import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  ValidationPipe,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthenticationService } from './authentication.service';
import { CreateUserDto } from 'dto/create-user.dto';
import { LoginDto } from 'dto/login.dto';
import { AppRequest } from 'middlewares/AuthMiddleware';

@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('register')
  @HttpCode(201)
  async register(
    @Body(ValidationPipe) createUserDto: CreateUserDto,
    @Res() res:Response
  ): Promise<void> {
    await this.authenticationService.Register(createUserDto);
    res.status(HttpStatus.CREATED).send();
  }

  @Post('login')
  @HttpCode(200)
  async login(
    @Body(ValidationPipe) loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const { accessToken, refreshToken } =
      await this.authenticationService.Login(loginDto);
    res.cookie('refreshToken', refreshToken, { httpOnly: true });
    res.cookie('accessToken', accessToken, { httpOnly: true });
    res.status(HttpStatus.OK).send();
  }

  @Post('refresh')
  async refreshToken(
    @Req() req: AppRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const { accessToken, refreshToken } =
      await this.authenticationService.refreshToken(req, res);
    res.cookie('refreshToken', refreshToken, { httpOnly: true });
    res.cookie('accessToken', accessToken, { httpOnly: true });
    res.status(HttpStatus.OK).send();
  }

  @Post('logout')
  async Logout(@Req() req: AppRequest, @Res() res: Response) {
    await this.authenticationService.revoke(req, res);
    res.status(HttpStatus.OK).send();
  }
}
