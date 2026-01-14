import {
  BadRequest,
  DeleteMapping,
  GetMapping,
  NotFound,
  PatchMapping,
  PathVariable,
  PostMapping,
  PutMapping,
  RequestBody,
  RequestParam,
  RestController,
  Valid,
} from '@kiqjs/http';
import { toResponse } from '@kiqjs/http/dto';

import { User, UserStatus } from '../../domains/User';
import { TemplateService } from './TemplateService';
import { CreateUserDto, UpdateUserDto } from './UserDto';
import { UserService } from './UserService';

import type { UserResponseDto } from './UserDto';

@RestController('/users')
export class UserHttpController {
  constructor(
    private readonly userService: UserService,
    private readonly templateService: TemplateService
  ) {}

  @GetMapping()
  async getAllUsers(@RequestParam({ name: 'status', required: false }) status?: string) {
    const result = await this.userService.getAllUsers();

    if (!result.success) {
      throw BadRequest(result.error);
    }

    let users = result.data;

    // Filter by status if provided
    if (status) {
      users = users.filter((u: User) => u.status === status);
    }

    return toResponse(users);
  }

  @GetMapping('/:id')
  async getUserById(@PathVariable('id') id: string) {
    const result = await this.userService.getUserById(id);

    if (!result.success) {
      throw NotFound(result.error);
    }

    return this.toResponseDto(result.data);
  }

  @PostMapping()
  async createUser(@RequestBody() @Valid() dto: CreateUserDto) {
    const result = await this.userService.createUser(dto);

    if (!result.success) {
      throw BadRequest(result.error);
    }

    return this.toResponseDto(result.data);
  }

  @PutMapping('/:id')
  async updateUser(@PathVariable('id') id: string, @RequestBody() @Valid() dto: UpdateUserDto) {
    // dto já vem validado automaticamente pelo @Valid()
    const result = await this.userService.updateUser(id, dto);

    if (!result.success) {
      throw BadRequest(result.error);
    }

    return this.toResponseDto(result.data);
  }

  @PatchMapping('/:id/activate')
  async activateUser(@PathVariable('id') id: string) {
    const result = await this.userService.activateUser(id);

    if (!result.success) {
      throw BadRequest(result.error);
    }

    return this.toResponseDto(result.data);
  }

  @PatchMapping('/:id/deactivate')
  async deactivateUser(@PathVariable('id') id: string) {
    const result = await this.userService.deactivateUser(id);

    if (!result.success) {
      throw BadRequest(result.error);
    }

    return this.toResponseDto(result.data);
  }

  @DeleteMapping('/:id')
  async deleteUser(@PathVariable('id') id: string) {
    const result = await this.userService.deleteUser(id);

    if (!result.success) {
      throw NotFound(result.error);
    }

    return { message: 'User deleted successfully' };
  }

  @GetMapping('/:id/welcome-email')
  async getWelcomeEmail(@PathVariable('id') id: string) {
    const result = await this.userService.getUserById(id);

    if (!result.success) {
      throw NotFound(result.error);
    }

    const user = result.data;

    const emailHtml = this.templateService.renderWelcomeEmail(
      user.name,
      user.email,
      user.status === UserStatus.ACTIVE ? 'Premium' : 'Standard'
    );

    return {
      userId: user.id,
      email: user.email,
      subject: 'Welcome to KiqJS!',
      html: emailHtml,
      note: 'Template loaded from resources/templates/welcome-email.html using ResourceLoader',
    };
  }

  private toResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      status: user.status,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
