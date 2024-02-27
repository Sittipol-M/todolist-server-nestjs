import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Types } from 'mongoose';

interface TokenPayload {
  userId: Types.ObjectId;
}

@Injectable()
export class TokenService {
  constructor(private jwtService: JwtService) {}

  async generateAccessToken(payload: TokenPayload): Promise<string> {
    const accessToken = await this.jwtService.signAsync(payload);
    return accessToken;
  }

  generateRefreshToken(): string {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let refreshToken = '';
    const charactersLength = characters.length;
    for (let i = 0; i < charactersLength; i++) {
      refreshToken += characters.charAt(
        Math.floor(Math.random() * charactersLength),
      );
    }

    return refreshToken;
  }

  async verifyAccessToken(
    accessToken: string,
    ignoreExpiration: boolean = false,
  ): Promise<TokenPayload> {
    const payload: TokenPayload = await this.jwtService.verifyAsync(
      accessToken,
      {
        secret: process.env.JWT_SECRET,
        ignoreExpiration,
      },
    );

    return payload;
  }
}
