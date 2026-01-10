/**
 * User Domain Entity
 * Representa o modelo de negócio puro de um usuário
 * Não depende de framework, banco de dados ou serviços externos
 */
export declare class User {
    readonly id: string;
    readonly name: string;
    readonly email: string;
    readonly status: UserStatus;
    readonly createdAt: Date;
    constructor(id: string, name: string, email: string, status: UserStatus, createdAt: Date);
    private validate;
    private isValidEmail;
    /**
     * Business rule: User can only be activated if status is PENDING
     */
    activate(): User;
    /**
     * Business rule: User can be deactivated from any status except DELETED
     */
    deactivate(): User;
    isActive(): boolean;
}
/**
 * User Status Value Object
 */
export declare enum UserStatus {
    PENDING = "PENDING",
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    DELETED = "DELETED"
}
