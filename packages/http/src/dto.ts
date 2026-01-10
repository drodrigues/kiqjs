// Re-export class-validator decorators so users don't need to install it directly
export {
  // Type validators
  IsString,
  IsNumber,
  IsBoolean,
  IsInt,
  IsArray,
  IsDate,
  IsObject,

  // String validators
  IsEmail,
  IsUrl,
  IsUUID,
  IsJSON,
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

  // Number validators
  Min,
  Max,
  IsPositive,
  IsNegative,

  // String length validators
  MinLength,
  MaxLength,
  Length,

  // Array validators
  ArrayMinSize,
  ArrayMaxSize,
  ArrayContains,
  ArrayNotContains,
  ArrayNotEmpty,
  ArrayUnique,

  // Common validators
  IsOptional,
  IsNotEmpty,
  IsEmpty,
  Matches,
  IsEnum,
  ValidateNested,

  // Conditional validators
  ValidateIf,

  // Custom validators
  Validate,
  ValidatorConstraint,
  registerDecorator,
} from 'class-validator';

// Re-export types
export type {
  ValidatorConstraintInterface,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

// Re-export class-transformer decorators
export { Type, Exclude, Expose, Transform } from 'class-transformer';

// Re-export class-transformer types
export type { TransformationType } from 'class-transformer';
