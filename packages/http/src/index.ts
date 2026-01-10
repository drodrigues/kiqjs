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
  ParamDecoratorOptions,
} from './metadata-keys';

// Validation utilities
export {
  transformAndValidate,
  validateDto,
  formatValidationErrors,
  DEFAULT_VALIDATOR_OPTIONS,
} from './validation';
export type { DtoValidationOptions } from './validation';
