/**
 * Result Type Pattern
 * Representa o resultado de uma operação que pode falhar
 * Evita exceptions para controle de fluxo
 */
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

export const success = <T, E = never>(data: T): Result<T, E> => ({
  success: true,
  data,
});

export const failure = <T = never, E = Error>(error: E): Result<T, E> => ({
  success: false,
  error,
});
