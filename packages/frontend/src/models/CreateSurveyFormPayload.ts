import { ChurchToolsEventDto, SurveyStatus } from "@ct-service-survey/shared"


export interface SelectedEvent {
  event: ChurchToolsEventDto;
  notes: string;
}

export interface CreateSurveyFormPayload {
  title: string;
  description: string;
  status: SurveyStatus;
  startDate: string;
  endDate: string;
  serviceId: number | undefined;
  selectedEvents: SelectedEvent[];
}