import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthenticationController } from './authentication/authentication.controller';
import { AuthenticationService } from './authentication/authentication.service';
import { UserSchema } from '../schemas/user.scheme';
import { TodoSchema } from '../schemas/todo.schema';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PasswordService } from './password/password.service';
import { TokenService } from './token/token.service';
import { AuthMiddleware } from 'middlewares/AuthMiddleware';
import { TodoController } from './todo/todo.controller';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.DB_URL, { dbName: 'todoDb' }),
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'Todo', schema: TodoSchema },
    ]),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions:{
        expiresIn:process.env.ACCESS_TOKEN_EXPIRE
      }
    }),
  ],
  controllers: [AuthenticationController, TodoController],
  providers: [AuthenticationService, PasswordService, TokenService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).exclude('authentication/(.*)').forRoutes('*');
  }
}
