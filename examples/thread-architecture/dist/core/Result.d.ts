/**
 * Result Type Pattern
 * Representa o resultado de uma operação que pode falhar
 * Evita exceptions para controle de fluxo
 */
export type Result<T, E = Error> = {
    success: true;
    data: T;
} | {
    success: false;
    error: E;
};
export declare const success: <T>(data: T) => Result<T>;
export declare const failure: <E = Error>(error: E) => Result<never, E>;
