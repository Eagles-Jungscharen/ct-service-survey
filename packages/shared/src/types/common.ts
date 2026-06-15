/**
 * Error Record
 */
export interface ErrorRecord {
  message: string;
  code?: number;
  details?: string;
}

/**
 * API Error
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: number,
    public details?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Me DTO (Current User)
 */
export interface MeDto {
  userId: string;
  displayName: string;
  email?: string;
  isAdmin: boolean;
  groups: GroupDto[];
}

/**
 * Group DTO for Me
 */
export interface GroupDto {
  id: string;
  name: string;
}

/**
 * Pagination Info
 */
export interface PaginationInfo {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

/**
 * Paginated Response
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}
