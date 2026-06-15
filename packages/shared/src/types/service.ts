/**
 * Service DTO
 */
export interface ServiceDto {
  id: string;
  name: string;
  churchToolsServiceId?: string;
  description?: string;
  isActive: boolean;
}

/**
 * ChurchTools Group DTO
 */
export interface GroupDto {
  id: string;
  name: string;
}
