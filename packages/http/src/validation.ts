import 'reflect-metadata';

import { plainToInstance } from 'class-transformer';
import { validate, ValidationError, ValidatorOptions } from 'class-validator';

import { BadRequest } from './exceptions';

/**
 * Default validator options
 */
export const DEFAULT_VALIDATOR_OPTIONS: ValidatorOptions = {
  whitelist: true,
  forbidNonWhitelisted: false,
  forbidUnknownValues: false,
  validationError: {
    target: false,
    value: false,
  },
};

/**
 * Validates a DTO instance using class-validator
 *
 * @param dtoInstance The DTO instance to validate
 * @param options Validator options
 * @throws HttpError with code 400 if validation fails
 */
export async function validateDto(
  dtoInstance: object,
  options: ValidatorOptions = DEFAULT_VALIDATOR_OPTIONS
): Promise<void> {
  const errors = await validate(dtoInstance, options);

  if (errors.length > 0) {
    const messages = formatValidationErrors(errors);
    throw BadRequest(messages);
  }
}

/**
 * Transforms plain object to DTO class instance and validates it
 *
 * @param dtoClass The DTO class constructor
 * @param plain Plain object to transform and validate
 * @param options Validator options
 * @returns Validated DTO instance
 * @throws HttpError with code 400 if validation fails
 */
export async function transformAndValidate<T extends object>(
  dtoClass: new () => T,
  plain: any,
  options: ValidatorOptions = DEFAULT_VALIDATOR_OPTIONS
): Promise<T> {
  if (!plain || typeof plain !== 'object') {
    throw BadRequest('Request body must be an object');
  }

  // Transform plain object to class instance
  const dtoInstance = plainToInstance(dtoClass, plain, { enableImplicitConversion: true });

  // Validate the instance
  await validateDto(dtoInstance, options);

  return dtoInstance;
}

/**
 * Formats validation errors into an array of messages
 *
 * @param errors Array of validation errors
 * @returns Array of error messages
 */
export function formatValidationErrors(errors: ValidationError[]): string[] {
  const messages: string[] = [];

  for (const error of errors) {
    if (error.constraints) {
      messages.push(...Object.values(error.constraints));
    }

    // Handle nested validation errors
    if (error.children && error.children.length > 0) {
      const nestedMessages = formatValidationErrors(error.children);
      messages.push(...nestedMessages);
    }
  }

  return messages;
}

/**
 * Options for DTO validation
 */
export interface DtoValidationOptions {
  /**
   * Whether to skip validation (default: false)
   */
  skipValidation?: boolean;

  /**
   * Custom validator options
   */
  validatorOptions?: ValidatorOptions;

  /**
   * Whether to transform the plain object to class instance (default: true)
   */
  transform?: boolean;
}
