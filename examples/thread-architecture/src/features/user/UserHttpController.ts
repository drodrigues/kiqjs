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

import { User } from '../../domains/User';
import { UserService } from './UserService';

import { CreateUserDto, UpdateUserDto } from './UserDto';
import type { UserResponseDto } from './UserDto';
/**
 * User HTTP Controller
 * Expõe endpoints REST para operações de usuário
 * Camada de entrada da feature
 */
@RestController('/users')
export class UserHttpController {
  constructor(private readonly userService: UserService) {}

  /**
   * GET /api/users
   * Lista todos os usuários
   */
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

  /**
   * GET /api/users/:id
   * Busca um usuário por ID
   */
  @GetMapping('/:id')
  async getUserById(@PathVariable('id') id: string) {
    const result = await this.userService.getUserById(id);

    if (!result.success) {
      throw NotFound(result.error);
    }

    return this.toResponseDto(result.data);
  }

  /**
   * POST /api/users
   * Cria um novo usuário com validação automática
   */
  @PostMapping()
  async createUser(@RequestBody() @Valid() dto: CreateUserDto) {
    // dto já vem validado automaticamente pelo @Valid()
    const result = await this.userService.createUser(dto);

    if (!result.success) {
      throw BadRequest(result.error);
    }

    return this.toResponseDto(result.data);
  }

  /**
   * PUT /api/users/:id
   * Atualiza um usuário com validação automática
   */
  @PutMapping('/:id')
  async updateUser(@PathVariable('id') id: string, @RequestBody() @Valid() dto: UpdateUserDto) {
    // dto já vem validado automaticamente pelo @Valid()
    const result = await this.userService.updateUser(id, dto);

    if (!result.success) {
      throw BadRequest(result.error);
    }

    return this.toResponseDto(result.data);
  }

  /**
   * PATCH /api/users/:id/activate
   * Ativa um usuário
   */
  @PatchMapping('/:id/activate')
  async activateUser(@PathVariable('id') id: string) {
    const result = await this.userService.activateUser(id);

    if (!result.success) {
      throw BadRequest(result.error);
    }

    return this.toResponseDto(result.data);
  }

  /**
   * PATCH /api/users/:id/deactivate
   * Desativa um usuário
   */
  @PatchMapping('/:id/deactivate')
  async deactivateUser(@PathVariable('id') id: string) {
    const result = await this.userService.deactivateUser(id);

    if (!result.success) {
      throw BadRequest(result.error);
    }

    return this.toResponseDto(result.data);
  }

  /**
   * DELETE /api/users/:id
   * Remove um usuário
   */
  @DeleteMapping('/:id')
  async deleteUser(@PathVariable('id') id: string) {
    const result = await this.userService.deleteUser(id);

    if (!result.success) {
      throw NotFound(result.error);
    }

    return { message: 'User deleted successfully' };
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
