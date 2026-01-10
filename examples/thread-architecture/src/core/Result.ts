/**
 * Result Type Pattern
 */
export type Result<T, E = Error> = { success: true; data: T } | { success: false; error: E };

export type CollectionResponseSerializer<T, M extends Record<string, any> = {}> = {
  data?: T[];
  meta: MetaSerializer<M>;
};

export type MetaSerializer<M extends Record<string, any> = {}> = {
  pagination: MetaPaginationSerializer;
} & M;

export type MetaPaginationSerializer = {
  currentPage?: number | null;
  limit: number;
  pages: number;
  total: number;
};

export const success = <T, E = never>(data: T): Result<T, E> => ({
  success: true,
  data,
});

export const failure = <T = never, E = Error>(error: E): Result<T, E> => ({
  success: false,
  error,
});

export const message = (code: number, messages: string[]) => ({
  code: 200,
  messages,
});

export function toResponse<T, M extends Record<string, any> = {}>(
  list: T[],
  meta?: { pagination?: Partial<MetaPaginationSerializer> } & M
): CollectionResponseSerializer<T, M> {
  const defaultPagination: MetaPaginationSerializer = {
    limit: list.length,
    currentPage: 1,
    total: list.length,
    pages: 1,
  };

  return {
    data: list,
    meta: {
      ...(meta ?? ({} as { pagination?: Partial<MetaPaginationSerializer> } & M)),
      pagination: {
        ...defaultPagination,
        ...(meta?.pagination ?? {}),
      },
    },
  };
}
