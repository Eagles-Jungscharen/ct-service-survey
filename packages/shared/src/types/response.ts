/**
 * Response DTO
 */
export interface ResponseDto {
  id: string;
  surveyId: string;
  userId: string;
  userName: string;
  availability: ServiceDateAvailability[];
  submittedAt: string;
  updatedAt: string;
}

/**
 * Service Date Availability
 */
export interface ServiceDateAvailability {
  serviceDateId: string;
  available: boolean;
  notes?: string;
}

/**
 * Create/Update Response Request
 */
export interface CreateUpdateResponseRequest {
  surveyId: string;
  availability: ServiceDateAvailability[];
}
