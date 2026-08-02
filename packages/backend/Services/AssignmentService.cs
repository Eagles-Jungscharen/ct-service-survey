using Azure.Data.Tables;
using Microsoft.Extensions.DependencyInjection;
using EaglesJungscharen.Azure.ServiceSurvey.Models.Dtos;
using EaglesJungscharen.Azure.ServiceSurvey.Models.Entities;
using GuedesPlace.AzureTools.Tables;

namespace EaglesJungscharen.Azure.ServiceSurvey.Services;

/// <summary>
/// Service-Implementierung für Einteilungen
/// </summary>
public class AssignmentService ([FromKeyedServices("SurveyStorage")] ExtendedAzureTableClientService tableService) : IAssignmentService
{
    private readonly TypedAzureTableClient<AssignmentEntity> _assignmentsTable = tableService.GetTypedTableClient<AssignmentEntity>();
    private readonly TypedAzureTableClient<SurveyEntity> _surveysTable = tableService.GetTypedTableClient<SurveyEntity>();
    private readonly TypedAzureTableClient<ServiceDateEntity> _serviceDatesTable = tableService.GetTypedTableClient<ServiceDateEntity>();

    
    public async Task<List<MyAssignmentDto>> GetMyAssignmentsAsync(string userId)
    {
        var assignments = new List<MyAssignmentDto>();

        // Alle Einteilungen des Users abrufen
        // RowKey Format: {serviceDateId}_{userId}
        var query = $"UserId eq '{userId}'";
        var assignementResponse = await _assignmentsTable.GetAllByQueryAsync(query);

        foreach (var assignment in assignementResponse.Select(r => r.Entity))
        {
            // Survey-Details abrufen
            SurveyEntity? survey = null;
            try
            {
                var surveyResponse = await _surveysTable.GetByIdAsync( assignment.SurveyId, "Survey");
                survey = surveyResponse?.Entity;
            }
            catch (global::Azure.RequestFailedException) { }

            // ServiceDate-Details abrufen
            ServiceDateEntity? serviceDate = null;
            try
            {
                var dateResponse = await _serviceDatesTable.GetByIdAsync(assignment.ServiceDateId, assignment.SurveyId);
                serviceDate = dateResponse?.Entity;
            }
            catch (global::Azure.RequestFailedException) { }

            if (survey != null && serviceDate != null)
            {
                assignments.Add(new MyAssignmentDto(
                    assignment.SurveyId,
                    survey.Title,
                    assignment.ServiceDateId,
                    serviceDate.Date,
                    serviceDate.ServiceTypeName,
                    assignment.AssignedAt
                ));
            }
        }

        return [.. assignments.OrderBy(a => a.Date)];
    }

    public async Task<List<AssignmentDto>> GetAssignmentsForSurveyAsync(string surveyId)
    {
        var assignmentsResponse = await _assignmentsTable.GetAllAsync(surveyId);
        var assignments = assignmentsResponse.Where(r => r.Entity != null).Select(r => MapToDto(r.Entity)).ToList();
        return assignments;
    }

    public async Task<List<AssignmentDto>> SubmitAssignmentsAsync(SubmitAssignmentsRequest request, string adminUserId)
    {
        var now = DateTime.UtcNow;
        var results = new List<AssignmentDto>();

        foreach (var assignmentRequest in request.Assignments)
        {
            // Zuerst: alle bestehenden Einteilungen für diesen Termin löschen
            await DeleteAssignmentsForServiceDateAsync(request.SurveyId, assignmentRequest.ServiceDateId);

            // Dann: neue Einteilungen erstellen
            foreach (var userId in assignmentRequest.UserIds)
            {
                var rowKey = $"{assignmentRequest.ServiceDateId}_{userId}";

                // TODO: UserName aus ChurchTools-API holen
                // Für MVP: verwenden wir erstmal die UserId
                var userName = userId;

                var entity = new AssignmentEntity
                {
                    AssignmentId = rowKey,
                    SurveyId = request.SurveyId,
                    ServiceDateId = assignmentRequest.ServiceDateId,
                    UserId = userId,
                    UserName = userName,
                    AssignedBy = adminUserId,
                    AssignedAt = now
                };

                await _assignmentsTable.InsertOrMergeAsync(entity.AssignmentId, request.SurveyId, entity);
                results.Add(MapToDto(entity));
            }
        }

        return results;
    }

    public async Task<bool> DeleteAssignmentsForServiceDateAsync(string surveyId, string serviceDateId)
    {
        // Alle Einteilungen für diesen Termin löschen
        var deletedAny = false;
        var query = $"PartitionKey eq '{surveyId}' and ServiceDateId eq '{serviceDateId}'";
        var assignmentsResponse = await _assignmentsTable.GetAllByQueryAsync(query);
        foreach (var assignment in assignmentsResponse.Select(r => r.Entity))
        {
            await _assignmentsTable.DeleteEntityAsync(assignment.AssignmentId, surveyId);
            deletedAny = true;
        }
        return deletedAny;
    }

    private static AssignmentDto MapToDto(AssignmentEntity entity)
    {
        return new AssignmentDto(
            entity.AssignmentId,
            entity.SurveyId,
            entity.ServiceDateId,
            entity.UserId,
            entity.UserName,
            entity.AssignedBy,
            entity.AssignedAt
        );
    }
}
