using Microsoft.Extensions.DependencyInjection;
using EaglesJungscharen.Azure.ServiceSurvey.Models.Dtos;
using EaglesJungscharen.Azure.ServiceSurvey.Models.Entities;
using GuedesPlace.AzureTools.Tables;

namespace EaglesJungscharen.Azure.ServiceSurvey.Services;

/// <summary>
/// Service-Implementierung für Rückmeldungen
/// </summary>
public class ResponseService([FromKeyedServices("SurveyStorage")] ExtendedAzureTableClientService tableService) : IResponseService
{
    private readonly TypedAzureTableClient<ResponseEntity>  _responsesTable = tableService.GetTypedTableClient<ResponseEntity>();


    public async Task<List<ResponseDto>> GetResponsesAsync(string surveyId, string userId)
    {
        var responses = new List<ResponseDto>();

        // Alle Rückmeldungen des Users für diese Umfrage
        var query = $"PartitionKey eq '{surveyId}' and userId eq '{userId}'";
        var responseEntities = await _responsesTable.GetAllByQueryAsync(query);
        responses = [.. responseEntities.Where(e => e.Entity != null).Select(e => e.Entity).Select(MapToDto)];
        return responses;
    }

    public async Task<List<ResponseDto>> GetAllResponsesForSurveyAsync(string surveyId)
    {
        var responses = new List<ResponseDto>();
        var responseEntities = await _responsesTable.GetAllAsync(surveyId);
        responses = [.. responseEntities.Where(e => e.Entity != null).Select(e => e.Entity).Select(MapToDto)];
        return responses;
    }

    public async Task<List<ResponseDto>> SubmitResponsesAsync(SubmitResponsesRequest request, string userId, string userName)
    {
        var now = DateTime.UtcNow;
        var results = new List<ResponseDto>();

        foreach (var responseRequest in request.Responses)
        {
            var rowKey = $"{userId}_{responseRequest.ServiceDateId}";

            // Prüfen ob Rückmeldung bereits existiert
            ResponseEntity? existingResponse = null;
            try
            {
                var response = await _responsesTable.GetByIdAsync(rowKey, request.SurveyId);
                existingResponse = response.Entity;
            }
            catch (global::Azure.RequestFailedException ex) when (ex.Status == 404)
            {
                // Noch keine Rückmeldung vorhanden
            }

            if (existingResponse != null)
            {
                // Update bestehende Rückmeldung
                existingResponse.Availability = responseRequest.Availability.ToString();
                existingResponse.Remarks = responseRequest.Remarks;
                existingResponse.UpdatedAt = now;
                await _responsesTable.InsertOrMergeAsync(rowKey, request.SurveyId,existingResponse);
                results.Add(MapToDto(existingResponse));
            }
            else
            {
                // Neue Rückmeldung erstellen
                var entity = new ResponseEntity
                {
                    ResponseId = rowKey,
                    SurveyId = request.SurveyId,
                    ServiceDateId = responseRequest.ServiceDateId,
                    UserId = userId,
                    UserName = userName,
                    Availability = responseRequest.Availability.ToString(),
                    Remarks = responseRequest.Remarks,
                    CreatedAt = now,
                    UpdatedAt = now
                };

                await _responsesTable.InsertOrReplaceAsync(rowKey, request.SurveyId, entity);
                results.Add(MapToDto(entity));
            }
        }

        return results;
    }

    private static ResponseDto MapToDto(ResponseEntity entity)
    {
        return new ResponseDto(
            entity.ResponseId,
            entity.SurveyId,
            entity.ServiceDateId,
            entity.UserId,
            entity.UserName,
            Enum.Parse<AvailabilityStatus>(entity.Availability),
            entity.Remarks,
            entity.CreatedAt,
            entity.UpdatedAt
        );
    }
}
