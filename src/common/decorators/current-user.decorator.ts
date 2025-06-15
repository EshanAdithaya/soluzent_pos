import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Employee } from '../../database/entities';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Employee => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);