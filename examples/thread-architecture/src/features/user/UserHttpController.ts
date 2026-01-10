import {
  DeleteMapping,
  GetMapping,
  PatchMapping,
  PathVariable,
  PostMapping,
  PutMapping,
  RequestBody,
  RequestParam,
  RestController,
} from '@kiqjs/http';

import { User } from '@/domains/User';
import { UserService } from '@/features/user/UserService';

import type { CreateUserDto, UpdateUserDto, UserResponseDto } from '@/features/user/UserDto';
/**
 * User HTTP Controller
 * Expõe endpoints REST para operações de usuário
 * Camada de entrada da feature
 */
@RestController('/api/users')
export class UserHttpController {
  constructor(private readonly userService: UserService) {}

  /**
   * GET /api/users
   * Lista todos os usuários
   */
  @GetMapping()
  async getAllUsers(@RequestParam('status', false) status?: string) {
    const result = await this.userService.getAllUsers();

    if (!result.success) {
      return { success: false, error: result.error };
    }

    let users = result.data;

    // Filter by status if provided
    if (status) {
      users = users.filter((u) => u.status === status);
    }

    return {
      success: true,
      data: users.map(this.toResponseDto),
      count: users.length,
    };
  }

  /**
   * GET /api/users/:id
   * Busca um usuário por ID
   */
  @GetMapping('/:id')
  async getUserById(@PathVariable('id') id: string) {
    const result = await this.userService.getUserById(id);

    if (!result.success) {
      return { success: false, error: result.error, status: 404 };
    }

    return {
      success: true,
      data: this.toResponseDto(result.data),
    };
  }

  /**
   * POST /api/users
   * Cria um novo usuário
   */
  @PostMapping()
  async createUser(@RequestBody() dto: CreateUserDto) {
    const result = await this.userService.createUser(dto);

    if (!result.success) {
      return { success: false, error: result.error, status: 400 };
    }

    return {
      success: true,
      data: this.toResponseDto(result.data),
      message: 'User created successfully',
    };
  }

  /**
   * PUT /api/users/:id
   * Atualiza um usuário
   */
  @PutMapping('/:id')
  async updateUser(@PathVariable('id') id: string, @RequestBody() dto: UpdateUserDto) {
    const result = await this.userService.updateUser(id, dto);

    if (!result.success) {
      return { success: false, error: result.error, status: 400 };
    }

    return {
      success: true,
      data: this.toResponseDto(result.data),
      message: 'User updated successfully',
    };
  }

  /**
   * PATCH /api/users/:id/activate
   * Ativa um usuário
   */
  @PatchMapping('/:id/activate')
  async activateUser(@PathVariable('id') id: string) {
    const result = await this.userService.activateUser(id);

    if (!result.success) {
      return { success: false, error: result.error, status: 400 };
    }

    return {
      success: true,
      data: this.toResponseDto(result.data),
      message: 'User activated successfully',
    };
  }

  /**
   * PATCH /api/users/:id/deactivate
   * Desativa um usuário
   */
  @PatchMapping('/:id/deactivate')
  async deactivateUser(@PathVariable('id') id: string) {
    const result = await this.userService.deactivateUser(id);

    if (!result.success) {
      return { success: false, error: result.error, status: 400 };
    }

    return {
      success: true,
      data: this.toResponseDto(result.data),
      message: 'User deactivated successfully',
    };
  }

  /**
   * DELETE /api/users/:id
   * Remove um usuário
   */
  @DeleteMapping('/:id')
  async deleteUser(@PathVariable('id') id: string) {
    const result = await this.userService.deleteUser(id);

    if (!result.success) {
      return { success: false, error: result.error, status: 404 };
    }

    return {
      success: true,
      message: 'User deleted successfully',
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
