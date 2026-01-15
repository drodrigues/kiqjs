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
 * Lazy-loaded configuration to avoid circular dependencies
 */
let cachedConfigOptions: ValidatorOptions | null = null;
let configInitialized = false;

/**
 * Load validator options from application configuration (application.yml)
 *
 * Reads configuration from kiqjs.validator key in application.yml
 *
 * @example
 * # application.yml
 * kiqjs:
 *   validator:
 *     skipMissingProperties: false
 *     whitelist: true
 *     forbidNonWhitelisted: false
 *     validationError:
 *       target: false
 *       value: false
 *
 * @returns ValidatorOptions from configuration or empty object if not configured
 */
function loadValidatorOptionsFromConfig(): ValidatorOptions {
  if (configInitialized) {
    return cachedConfigOptions || {};
  }

  configInitialized = true;

  try {
    // Lazy load to avoid circular dependencies
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getConfiguration } = require('@kiqjs/core');
    const config = getConfiguration();

    if (config.has('kiqjs.validator')) {
      const validatorConfig = config.getObject('kiqjs.validator');
      cachedConfigOptions = validatorConfig;
      return validatorConfig;
    }
  } catch (error) {
    // @kiqjs/core not available or no configuration found
    // This is fine - validator works standalone without configuration
  }

  return {};
}

/**
 * Get merged validator options
 * Priority (highest to lowest):
 * 1. Options passed programmatically
 * 2. Options from application.yml (kiqjs.validator)
 * 3. DEFAULT_VALIDATOR_OPTIONS
 *
 * @param options Optional validator options passed programmatically
 * @returns Merged validator options
 */
function getMergedValidatorOptions(options?: ValidatorOptions): ValidatorOptions {
  const configOptions = loadValidatorOptionsFromConfig();

  return {
    ...DEFAULT_VALIDATOR_OPTIONS,
    ...configOptions,
    ...options,
  };
}

/**
 * Validates a DTO instance using class-validator
 *
 * @param dtoInstance The DTO instance to validate
 * @param options Validator options (optional, merges with config and defaults)
 * @throws HttpError with code 400 if validation fails
 */
export async function validateDto(
  dtoInstance: object,
  options?: ValidatorOptions
): Promise<void> {
  const mergedOptions = getMergedValidatorOptions(options);
  const errors = await validate(dtoInstance, mergedOptions);

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
 * @param options Validator options (optional, merges with config and defaults)
 * @returns Validated DTO instance
 * @throws HttpError with code 400 if validation fails
 */
export async function transformAndValidate<T extends object>(
  dtoClass: new () => T,
  plain: any,
  options?: ValidatorOptions
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
