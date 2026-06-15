/**
 * Assignment DTO
 */
export interface AssignmentDto {
  id: string;
  serviceDateId: string;
  surveyId: string;
  userId: string;
  userName: string;
  serviceType: string;
  serviceTypeName: string;
  date: string;
  confirmedAt?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

/**
 * Create Assignment Request
 */
export interface CreateAssignmentRequest {
  serviceDateId: string;
  userId: string;
  notes?: string;
}

/**
 * Batch Create Assignments Request
 */
export interface BatchCreateAssignmentsRequest {
  surveyId: string;
  assignments: CreateAssignmentRequest[];
}
