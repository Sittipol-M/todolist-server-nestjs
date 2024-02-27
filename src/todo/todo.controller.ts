import { Controller, Get, Req } from '@nestjs/common';
import { AppRequest } from 'middlewares/AuthMiddleware';

@Controller('todos')
export class TodoController {
  @Get()
  GetAll(@Req() request: AppRequest): [] {
    console.log(request.user.id);
    return [];
  }
}
