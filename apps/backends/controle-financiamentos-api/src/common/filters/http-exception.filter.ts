import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiErrorResponse } from '@simas-quita/shared-financing-types';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const body = this.buildErrorBody(status, exceptionResponse);
      response.status(status).json(body);
      return;
    }

    const body: ApiErrorResponse = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    };

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(body);
  }

  private buildErrorBody(
    status: number,
    exceptionResponse: string | object,
  ): ApiErrorResponse {
    if (typeof exceptionResponse === 'string') {
      return {
        statusCode: status,
        message: exceptionResponse,
      };
    }

    const responseObject = exceptionResponse as Record<string, unknown>;
    const message = this.extractMessage(responseObject);
    const errors = this.extractErrors(responseObject);

    return {
      statusCode: status,
      message,
      ...(errors ? { errors } : {}),
    };
  }

  private extractMessage(responseObject: Record<string, unknown>): string {
    if (Array.isArray(responseObject.message)) {
      return responseObject.message.join(', ');
    }

    if (typeof responseObject.message === 'string') {
      return responseObject.message;
    }

    return 'Request failed';
  }

  private extractErrors(
    responseObject: Record<string, unknown>,
  ): Record<string, string[]> | undefined {
    if (!responseObject.errors || typeof responseObject.errors !== 'object') {
      return undefined;
    }

    return responseObject.errors as Record<string, string[]>;
  }
}
