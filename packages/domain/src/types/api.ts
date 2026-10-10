/**
 * Standard API contracts, pagination metadata, and security context.
 * Complies with Constitution Principle VII: mandatory pagination with default 25 and max 100 items.
 */

export interface PaginatedQuery {
  readonly page?: number;
  readonly limit?: number;
  readonly sortBy?: string;
  readonly sortOrder?: 'asc' | 'desc';
}

export interface PaginationMeta {
  readonly currentPage: number;
  readonly pageSize: number;
  readonly totalItems: number;
  readonly totalPages: number;
  readonly hasNextPage: boolean;
  readonly hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  readonly items: ReadonlyArray<T>;
  readonly pagination: PaginationMeta;
}

export interface ApiResponse<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: {
    readonly code: string;
    readonly message: string;
    readonly details?: unknown;
  };
  readonly message?: string;
}

export interface SecurityContext {
  readonly tenantId: string;
  readonly userId: string;
  readonly role: string;
  readonly isSuperAdmin: boolean;
}
