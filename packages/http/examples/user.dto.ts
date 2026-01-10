import { IsString, IsEmail, MinLength, IsOptional, MaxLength } from 'class-validator';

/**
 * DTO for creating a new user
 */
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

/**
 * DTO for updating a user
 */
export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @MinLength(3, { message: 'Name must be at least 3 characters long' })
  @MaxLength(50, { message: 'Name must not exceed 50 characters' })
  name?: string;

  @IsString()
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @MinLength(10, { message: 'Address must be at least 10 characters long' })
  address?: string;
}
