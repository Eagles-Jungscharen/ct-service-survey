using Azure.Data.Tables;
using Microsoft.Extensions.DependencyInjection;
using EaglesJungscharen.Azure.ServiceSurvey.Models.Dtos;
using EaglesJungscharen.Azure.ServiceSurvey.Models.Entities;

namespace EaglesJungscharen.Azure.ServiceSurvey.Services;

/// <summary>
/// Service-Implementierung für Einteilungen
/// </summary>
public class AssignmentService : IAssignmentService
{
    private readonly TableClient _assignmentsTable;
    private readonly TableClient _surveysTable;
    private readonly TableClient _serviceDatesTable;

    public AssignmentService(
        [FromKeyedServices("Assignments")] TableClient assignmentsTable,
        [FromKeyedServices("Surveys")] TableClient surveysTable,
        [FromKeyedServices("ServiceDates")] TableClient serviceDatesTable)
    {
        _assignmentsTable = assignmentsTable;
        _surveysTable = surveysTable;
        _serviceDatesTable = serviceDatesTable;
    }

    public async Task<List<MyAssignmentDto>> GetMyAssignmentsAsync(string userId)
    {
        var assignments = new List<MyAssignmentDto>();

        // Alle Einteilungen des Users abrufen
        // RowKey Format: {serviceDateId}_{userId}
        await foreach (var assignment in _assignmentsTable.QueryAsync<AssignmentEntity>(a => a.UserId == userId))
        {
            // Survey-Details abrufen
            SurveyEntity? survey = null;
            try
            {
                var surveyResponse = await _surveysTable.GetEntityAsync<SurveyEntity>("Survey", assignment.SurveyId);
                survey = surveyResponse.Value;
            }
            catch (global::Azure.RequestFailedException) { }

            // ServiceDate-Details abrufen
            ServiceDateEntity? serviceDate = null;
            try
            {
                var dateResponse = await _serviceDatesTable.GetEntityAsync<ServiceDateEntity>(
                    assignment.SurveyId, assignment.ServiceDateId);
                serviceDate = dateResponse.Value;
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

        return assignments.OrderBy(a => a.Date).ToList();
    }

    public async Task<List<AssignmentDto>> GetAssignmentsForSurveyAsync(string surveyId)
    {
        var assignments = new List<AssignmentDto>();

        await foreach (var assignment in _assignmentsTable.QueryAsync<AssignmentEntity>(a => a.PartitionKey == surveyId))
        {
            assignments.Add(MapToDto(assignment));
        }

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
                    PartitionKey = request.SurveyId,
                    RowKey = rowKey,
                    SurveyId = request.SurveyId,
                    ServiceDateId = assignmentRequest.ServiceDateId,
                    UserId = userId,
                    UserName = userName,
                    AssignedBy = adminUserId,
                    AssignedAt = now
                };

                await _assignmentsTable.AddEntityAsync(entity);
                results.Add(MapToDto(entity));
            }
        }

        return results;
    }

    public async Task<bool> DeleteAssignmentsForServiceDateAsync(string surveyId, string serviceDateId)
    {
        // Alle Einteilungen für diesen Termin löschen
        var deletedAny = false;

        await foreach (var assignment in _assignmentsTable.QueryAsync<AssignmentEntity>(
            a => a.PartitionKey == surveyId && a.ServiceDateId == serviceDateId))
        {
            await _assignmentsTable.DeleteEntityAsync(surveyId, assignment.RowKey);
            deletedAny = true;
        }

        return deletedAny;
    }

    private static AssignmentDto MapToDto(AssignmentEntity entity)
    {
        return new AssignmentDto(
            entity.SurveyId,
            entity.ServiceDateId,
            entity.UserId,
            entity.UserName,
            entity.AssignedBy,
            entity.AssignedAt
        );
    }
}
