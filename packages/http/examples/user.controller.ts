import { RestController, GetMapping, PostMapping, PutMapping, PathVariable, RequestBody } from '../src';
import { CreateUserDto, UpdateUserDto } from './user.dto';

/**
 * Example REST controller with automatic DTO validation
 */
@RestController('/users')
export class UserController {
  /**
   * Get all users
   */
  @GetMapping()
  getUsers() {
    return [
      { id: '1', name: 'John Doe', email: 'john@example.com' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
    ];
  }

  /**
   * Get user by ID
   */
  @GetMapping('/:id')
  getUser(@PathVariable('id') id: string) {
    return { id, name: 'John Doe', email: 'john@example.com' };
  }

  /**
   * Create new user with automatic validation
   * The @RequestBody decorator will automatically validate the request body
   * against the CreateUserDto class using class-validator
   */
  @PostMapping()
  createUser(@RequestBody(CreateUserDto) user: CreateUserDto) {
    // At this point, user is guaranteed to be valid
    // - name is a string with 3-50 characters
    // - email is a valid email address
    // - address is optional, but if provided, must be at least 10 characters

    return {
      id: '123',
      ...user,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Update user with automatic validation
   */
  @PutMapping('/:id')
  updateUser(@PathVariable('id') id: string, @RequestBody(UpdateUserDto) updates: UpdateUserDto) {
    // All fields in UpdateUserDto are optional, but if provided, must be valid
    return {
      id,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
  }
}
