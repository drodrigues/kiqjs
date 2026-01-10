import { IsString, IsEmail, MinLength, MaxLength, IsOptional } from '@kiqjs/http';

/**
 * Data Transfer Objects for User feature
 */

/**
 * DTO for creating a new user
 * Includes automatic validation with class-validator
 */
export class CreateUserDto {
  @IsString({ message: 'Name must be a string' })
  @MinLength(3, { message: 'Name must be at least 3 characters long' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name: string;

  @IsString({ message: 'Email must be a string' })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;
}

/**
 * DTO for updating a user
 * All fields are optional, but if provided, must be valid
 */
export class UpdateUserDto {
  @IsString({ message: 'Name must be a string' })
  @MinLength(3, { message: 'Name must be at least 3 characters long' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  @IsOptional()
  name?: string;

  @IsString({ message: 'Email must be a string' })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsOptional()
  email?: string;
}

/**
 * DTO for user response
 */
export interface UserResponseDto {
  id: string;
  name: string;
  email: string;
  status: string;
  createdAt: string;
}
