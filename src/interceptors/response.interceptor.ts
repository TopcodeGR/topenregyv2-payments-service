import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

import { IGenericResponse } from '../types/app.types';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, IGenericResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<IGenericResponse<T>> {
    const res = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data) => ({
        statusCode: res.statusCode,
        message: '',
        success: true,
        data,
      })),
    );
  }
}
