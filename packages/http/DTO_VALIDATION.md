# DTO Validation with @kiqjs/http

The `@kiqjs/http` package provides automatic DTO (Data Transfer Object) validation using `class-validator` and `class-transformer`.

## Installation

The validation dependencies are already included with `@kiqjs/http`:

```bash
pnpm add @kiqjs/http
```

## Basic Usage

### 1. Define your DTO class

All validation decorators are re-exported from `@kiqjs/http`, so you don't need to install `class-validator` directly:

```typescript
import { IsString, IsEmail, MinLength, IsOptional, MaxLength } from '@kiqjs/http';

export class CreateUserDto {
  @IsString()
  @MinLength(3, { message: 'Name must be at least 3 characters long' })
  @MaxLength(50, { message: 'Name must not exceed 50 characters' })
  name: string;

  @IsString()
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;

  @IsString()
  @IsOptional()
  @MinLength(10, { message: 'Address must be at least 10 characters long' })
  address?: string;
}
```

### 2. Use the `@RequestBody()` and `@Valid()` decorators in your controller

```typescript
import { RestController, PostMapping, RequestBody, Valid } from '@kiqjs/http';
import { CreateUserDto } from './dtos/user.dto';

@RestController('/users')
export class UserController {
  @PostMapping()
  createUser(@RequestBody() @Valid() user: CreateUserDto) {
    // At this point, user is guaranteed to be valid
    // All validations passed automatically

    return {
      id: '123',
      ...user,
      createdAt: new Date().toISOString(),
    };
  }
}
```

## How it Works

When you use the `@RequestBody()` with `@Valid()` decorators (Spring Boot style):

1. **Type Detection**: The `@Valid()` decorator reads the parameter type from TypeScript metadata
2. **Transformation**: The plain request body object is transformed into an instance of the DTO class
3. **Validation**: All `class-validator` decorators are automatically validated
4. **Error Handling**: If validation fails, an `HttpError` with status 400 is thrown
5. **Whitelist**: Unknown properties are automatically stripped from the DTO

## Validation Error Response

When validation fails, the API automatically returns a structured error response:

```json
{
  "success": false,
  "error": "Validation failed",
  "status": 400,
  "details": {
    "name": ["name must be at least 3 characters long"],
    "email": ["email must be a valid email address"]
  }
}
```

## Available Decorators

All decorators are imported from `@kiqjs/http`:

- `@IsString()` - Validates that the property is a string
- `@IsNumber()` - Validates that the property is a number
- `@IsEmail()` - Validates that the property is a valid email
- `@IsOptional()` - Marks the property as optional
- `@MinLength(n)` - Validates minimum string length
- `@MaxLength(n)` - Validates maximum string length
- `@Min(n)` - Validates minimum number value
- `@Max(n)` - Validates maximum number value
- `@IsInt()` - Validates that the number is an integer
- `@IsBoolean()` - Validates that the property is a boolean
- `@IsArray()` - Validates that the property is an array
- `@IsDate()` - Validates that the property is a date
- `@IsEnum(enum)` - Validates that the property is an enum value
- `@ValidateNested()` - Validates nested objects
- `@Type()` - For nested object transformation (from class-transformer)
- And many more! See [class-validator documentation](https://github.com/typestack/class-validator)

**Note**: You don't need to install `class-validator` or `class-transformer` directly. All decorators are re-exported from `@kiqjs/http`.

## Examples

### Update DTO with Optional Fields

```typescript
export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(50)
  name?: string;

  @IsString()
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @MinLength(10)
  address?: string;
}

@RestController('/users')
export class UserController {
  @PutMapping('/:id')
  updateUser(
    @PathVariable('id') id: string,
    @RequestBody() @Valid() updates: UpdateUserDto
  ) {
    // All fields are optional, but if provided, must be valid
    return { id, ...updates, updatedAt: new Date().toISOString() };
  }
}
```

### Nested DTOs

```typescript
import { IsString, IsEmail, MinLength, Length, ValidateNested, Type } from '@kiqjs/http';

export class AddressDto {
  @IsString()
  @MinLength(5)
  street: string;

  @IsString()
  city: string;

  @IsString()
  @Length(5, 5)
  zipCode: string;
}

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsEmail()
  email: string;

  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;
}
```

### Array Validation

```typescript
import { IsArray, ArrayMinSize, ValidateNested, Type, IsString, IsInt, Min } from '@kiqjs/http';

export class CreateOrderDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'Order must have at least one item' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}

export class OrderItemDto {
  @IsString()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}
```

## Manual Validation

If you need to manually validate a DTO outside of a controller:

```typescript
import { transformAndValidate } from '@kiqjs/http';
import { CreateUserDto } from './dtos/user.dto';

async function validateUser(data: unknown) {
  try {
    const validatedUser = await transformAndValidate(CreateUserDto, data);
    console.log('Valid user:', validatedUser);
  } catch (error) {
    if (error instanceof HttpError) {
      console.log('Validation errors:', error.details);
    }
  }
}
```

## Comparison: @RequestBody() vs @RequestBody() @Valid()

### @RequestBody() - No Validation

```typescript
@PostMapping()
createUser(@RequestBody() user: any) {
  // user is just a plain object
  // No validation, no type safety
  return user;
}
```

### @RequestBody() @Valid() - With Validation (Spring Boot style)

```typescript
@PostMapping()
createUser(@RequestBody() @Valid() user: CreateUserDto) {
  // user is a validated instance of CreateUserDto
  // All validations passed
  // Type-safe
  return user;
}
```

## Best Practices

1. **Always use DTOs for input validation** - Never trust user input
2. **Use specific validation messages** - Help users understand what went wrong
3. **Mark optional fields explicitly** - Use `@IsOptional()` decorator
4. **Strip unknown properties** - This is done automatically for security
5. **Use nested DTOs for complex objects** - Break down complex structures
6. **Validate arrays properly** - Use `@ValidateNested({ each: true })`
7. **Keep DTOs simple** - One DTO per operation (Create, Update, etc.)

## Error Handling

Validation errors are automatically caught and returned as HTTP 400 responses. You don't need to handle them manually:

```typescript
@PostMapping()
createUser(@RequestBody() @Valid() user: CreateUserDto) {
  // If execution reaches here, validation passed
  // No need for try-catch blocks
  return this.userService.create(user);
}
```

## Advanced Configuration

You can customize validation options:

```typescript
import { transformAndValidate, DEFAULT_VALIDATOR_OPTIONS } from '@kiqjs/http';

// Custom options
const customOptions = {
  ...DEFAULT_VALIDATOR_OPTIONS,
  skipMissingProperties: false,
  whitelist: true,
  forbidNonWhitelisted: false,
};

const validated = await transformAndValidate(CreateUserDto, data, customOptions);
```

## See Also

- [class-validator documentation](https://github.com/typestack/class-validator)
- [class-transformer documentation](https://github.com/typestack/class-transformer)
- [Examples](./examples/)
