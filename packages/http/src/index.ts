import 'reflect-metadata';

// Decorators
export {
  RestController,
  RequestMapping,
  GetMapping,
  PostMapping,
  PutMapping,
  DeleteMapping,
  PatchMapping,
  RequestBody,
  Valid,
  RequestPart,
  PathVariable,
  RequestParam,
  RequestHeader,
  Context,
  Request,
  Response,
} from './decorators';

// Application
export { KiqHttpApplication, startKiqHttpApplication, logger } from './application';
export type { KiqHttpApplicationOptions } from './application';

// Router utilities
export { registerControllers, HttpError } from './router';

// Metadata types
export type {
  HttpMethod,
  RequestMappingMetadata,
  RouteHandlerMetadata,
  ParamMetadata,
} from './metadata-keys';

// Validation utilities
export {
  transformAndValidate,
  validateDto,
  formatValidationErrors,
  DEFAULT_VALIDATOR_OPTIONS,
} from './validation';
export type { DtoValidationOptions } from './validation';

// Re-export class-validator decorators so users don't need to install it directly
export {
  IsString,
  IsNumber,
  IsBoolean,
  IsInt,
  IsArray,
  IsDate,
  IsEmail,
  IsEnum,
  IsOptional,
  MinLength,
  MaxLength,
  Min,
  Max,
  Length,
  ArrayMinSize,
  ArrayMaxSize,
  ValidateNested,
  IsNotEmpty,
  IsEmpty,
  Matches,
  IsUrl,
  IsUUID,
  IsJSON,
  IsObject,
  IsAlphanumeric,
  IsAlpha,
  IsHexColor,
  IsIP,
  IsPort,
  IsMobilePhone,
  IsPostalCode,
  IsCreditCard,
  IsCurrency,
  IsISO8601,
  IsLatLong,
} from 'class-validator';

// Re-export class-transformer decorators
export { Type, Exclude, Expose, Transform } from 'class-transformer';
