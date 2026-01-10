import { UserService } from '@/features/user/UserService';
import type { CreateUserDto, UpdateUserDto, UserResponseDto } from '@/features/user/UserDto';
/**
 * User HTTP Controller
 * Expõe endpoints REST para operações de usuário
 * Camada de entrada da feature
 */
export declare class UserHttpController {
    private readonly userService;
    constructor(userService: UserService);
    /**
     * GET /api/users
     * Lista todos os usuários
     */
    getAllUsers(status?: string): Promise<{
        success: boolean;
        error: string;
        data?: undefined;
        count?: undefined;
    } | {
        success: boolean;
        data: UserResponseDto[];
        count: number;
        error?: undefined;
    }>;
    /**
     * GET /api/users/:id
     * Busca um usuário por ID
     */
    getUserById(id: string): Promise<{
        success: boolean;
        error: string;
        status: number;
        data?: undefined;
    } | {
        success: boolean;
        data: UserResponseDto;
        error?: undefined;
        status?: undefined;
    }>;
    /**
     * POST /api/users
     * Cria um novo usuário
     */
    createUser(dto: CreateUserDto): Promise<{
        success: boolean;
        error: string;
        status: number;
        data?: undefined;
        message?: undefined;
    } | {
        success: boolean;
        data: UserResponseDto;
        message: string;
        error?: undefined;
        status?: undefined;
    }>;
    /**
     * PUT /api/users/:id
     * Atualiza um usuário
     */
    updateUser(id: string, dto: UpdateUserDto): Promise<{
        success: boolean;
        error: string;
        status: number;
        data?: undefined;
        message?: undefined;
    } | {
        success: boolean;
        data: UserResponseDto;
        message: string;
        error?: undefined;
        status?: undefined;
    }>;
    /**
     * PATCH /api/users/:id/activate
     * Ativa um usuário
     */
    activateUser(id: string): Promise<{
        success: boolean;
        error: string;
        status: number;
        data?: undefined;
        message?: undefined;
    } | {
        success: boolean;
        data: UserResponseDto;
        message: string;
        error?: undefined;
        status?: undefined;
    }>;
    /**
     * PATCH /api/users/:id/deactivate
     * Desativa um usuário
     */
    deactivateUser(id: string): Promise<{
        success: boolean;
        error: string;
        status: number;
        data?: undefined;
        message?: undefined;
    } | {
        success: boolean;
        data: UserResponseDto;
        message: string;
        error?: undefined;
        status?: undefined;
    }>;
    /**
     * DELETE /api/users/:id
     * Remove um usuário
     */
    deleteUser(id: string): Promise<{
        success: boolean;
        error: string;
        status: number;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        error?: undefined;
        status?: undefined;
    }>;
    private toResponseDto;
}
