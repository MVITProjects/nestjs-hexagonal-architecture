import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { EmailAlreadyInUseException } from '../../../../domain/exception/email-already-in-use.exception.js';
import { InvalidEmailException } from '../../../../domain/exception/invalid-email.exception.js';
import { UserNotFoundException } from '../../../../domain/exception/user-not-found.exception.js';

type DomainException =
  UserNotFoundException | EmailAlreadyInUseException | InvalidEmailException;

@Catch(UserNotFoundException, EmailAlreadyInUseException, InvalidEmailException)
export class GlobalExceptionHandler implements ExceptionFilter<DomainException> {
  catch(error: DomainException, host: ArgumentsHost) {
    const status =
      error instanceof UserNotFoundException
        ? HttpStatus.NOT_FOUND
        : error instanceof EmailAlreadyInUseException
          ? HttpStatus.CONFLICT
          : HttpStatus.BAD_REQUEST;

    host.switchToHttp().getResponse<Response>().status(status).json({
      statusCode: status,
      error: error.name,
      message: error.message,
    });
  }
}
