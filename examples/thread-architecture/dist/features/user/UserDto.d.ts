/**
 * Data Transfer Objects for User feature
 */
export interface CreateUserDto {
    name: string;
    email: string;
}
export interface UpdateUserDto {
    name?: string;
    email?: string;
}
export interface UserResponseDto {
    id: string;
    name: string;
    email: string;
    status: string;
    createdAt: string;
}
