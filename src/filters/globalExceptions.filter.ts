import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionsFilter implements ExceptionFilter {
    catch(exception, host: ArgumentsHost) {
        console.log(exception)
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception.getStatus();

        response
            .status(status)
            .json({
                statusCode: status,
                success: false,
                data: null,
                message: exception.response.message !== '' && exception.response.message ? exception.response.message : exception.response.error
            });
    }
}