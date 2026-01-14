import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from '@kiqjs/http/dto';

export class CreateUserDto {
  @IsString({ message: 'Name must be a string' })
  @MinLength(3, { message: 'Name must be at least 3 characters long' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name!: string;

  @IsString({ message: 'Email must be a string' })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email!: string;
}

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

export interface UserResponseDto {
  id: string;
  name: string;
  email: string;
  status: string;
  createdAt: string;
}
