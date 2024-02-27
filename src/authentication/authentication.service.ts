import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Document, Model, Types } from 'mongoose';
import { CreateUserDto } from 'dto/create-user.dto';
import { LoginDto } from 'dto/login.dto';
import { User } from 'schemas/user.scheme';
import { PasswordService } from 'src/password/password.service';
import { TokenService } from 'src/token/token.service';
import { Response } from 'express';
import { AppRequest } from 'middlewares/AuthMiddleware';

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectModel('User') private userModel: Model<User>,
    private tokenService: TokenService,
    private passwordService: PasswordService,
  ) {}

  async Register(createUserDto: CreateUserDto): Promise<void> {
    await this.CheckDuplicateRegisterUser(createUserDto);
    const newUser = await this.userModel.create({
      ...createUserDto,
      password: await this.passwordService.encrypt(createUserDto.password),
    });
    await newUser.save();
  }

  async CheckDuplicateRegisterUser({ username }: CreateUserDto) {
    const user = await this.userModel.findOne({ username });
    if (user) throw new ConflictException('username is used');
  }

  async Login({ username, password }: LoginDto): Promise<LoginResponse> {
    const user = await this.userModel.findOne({ username });
    const refreshTokenExpireDay = process.env.REFRESH_TOKEN_EXPIRE_DAYS;
    const now = new Date();

    if (!user) {
      throw new UnauthorizedException('Username is invalid');
    }

    await this.passwordService.verify(password, user);

    const newAccessToken = await this.tokenService.generateAccessToken({
      userId: user.id,
    });
    const newRefreshToken = this.tokenService.generateRefreshToken();

    const refreshTokenExpire = new Date();
    refreshTokenExpire.setDate(
      now.getDate() + Number.parseInt(refreshTokenExpireDay),
    );

    user.refreshToken = newRefreshToken;
    user.refreshTokenExpire = refreshTokenExpire;
    await user.save();

    const response: LoginResponse = {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
    return response;
  }

  async refreshToken(
    req: AppRequest,
    res: Response,
  ): Promise<RefreshTokenResponse> {
    const refreshToken = req.cookies.refreshToken;
    const accessToken = req.cookies.accessToken;

    const { userId } = await this.tokenService.verifyAccessToken(
      accessToken,
      true,
    );

    const refreshTokenExpireDay = process.env.REFRESH_TOKEN_EXPIRE_DAYS;

    const user = await this.userModel.findById(userId);

    if (user.refreshToken !== refreshToken) {
      await this.revoke(req, res, user);
      throw new UnauthorizedException();
    }

    const newAccessToken = await this.tokenService.generateAccessToken({
      userId: user.id,
    });
    const newRefreshToken = this.tokenService.generateRefreshToken();

    const now = new Date();
    const refreshTokenExpire = new Date();
    refreshTokenExpire.setDate(
      now.getDate() + Number.parseInt(refreshTokenExpireDay),
    );

    user.refreshToken = newRefreshToken;
    user.refreshTokenExpire = refreshTokenExpire;

    await user.save();

    const response: RefreshTokenResponse = {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
    return response;
  }

  async revoke(
    req: AppRequest,
    res: Response,
    user?: Document<unknown, {}, User> &
      User & {
        _id: Types.ObjectId;
      },
  ) {
    const accessToken = req.cookies.accessToken;

    if (!user) {
      const { userId } = await this.tokenService.verifyAccessToken(
        accessToken,
        true,
      );
      user = await this.userModel.findById(userId);
    }

    user.refreshToken = undefined;
    user.refreshTokenExpire = undefined;

    await user.save();
    res.clearCookie('refreshToken');
    res.clearCookie('accessToken');
  }
}
