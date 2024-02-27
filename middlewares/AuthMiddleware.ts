import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Response, Request } from 'express';
import { Types } from 'mongoose';
import { TokenService } from 'src/token/token.service';

export type AppRequest = { user: { id: Types.ObjectId } } & Request;

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly tokenService: TokenService) {}
  use(req: AppRequest, _: Response, next: NextFunction) {
    const accessToken = req.cookies['accessToken'];
    this.tokenService
      .verifyAccessToken(accessToken)
      .then(({ userId }) => {
        req.user = { id: userId };
        next();
      })
      .catch(() => {
        next(new UnauthorizedException('accessToken is expire'));
      });
  }
}
