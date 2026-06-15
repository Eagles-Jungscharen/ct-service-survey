/**
 * Survey Status Enum
 */
export enum SurveyStatus {
  Draft = 'Draft',
  Active = 'Active',
  Closed = 'Closed',
}

/**
 * Survey DTO
 */
export interface SurveyDto {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdByName: string;
  status: SurveyStatus;
  createdAt: string;
  updatedAt: string;
  dates: ServiceDateDto[];
}

/**
 * Service Date DTO
 */
export interface ServiceDateDto {
  id: string;
  surveyId: string;
  date: string;
  serviceType: string;
  serviceTypeName: string;
  requiredPeople: number;
  notes?: string;
}

/**
 * Create/Update Survey Request
 */
export interface CreateUpdateSurveyRequest {
  name: string;
  description?: string;
  status: SurveyStatus;
  dates: CreateUpdateServiceDateRequest[];
}

/**
 * Create/Update Service Date Request
 */
export interface CreateUpdateServiceDateRequest {
  date: string;
  serviceType: string;
  requiredPeople: number;
  notes?: string;
}
