using Azure.Data.Tables;
using Microsoft.Extensions.DependencyInjection;
using EaglesJungscharen.Azure.ServiceSurvey.Models.Dtos;
using EaglesJungscharen.Azure.ServiceSurvey.Models.Entities;

namespace EaglesJungscharen.Azure.ServiceSurvey.Services;

/// <summary>
/// Service-Implementierung für Rückmeldungen
/// </summary>
public class ResponseService : IResponseService
{
    private readonly TableClient _responsesTable;

    public ResponseService([FromKeyedServices("Responses")] TableClient responsesTable)
    {
        _responsesTable = responsesTable;
    }

    public async Task<List<ResponseDto>> GetResponsesAsync(string surveyId, string userId)
    {
        var responses = new List<ResponseDto>();

        // Alle Rückmeldungen des Users für diese Umfrage
        await foreach (var response in _responsesTable.QueryAsync<ResponseEntity>(
            r => r.PartitionKey == surveyId && r.UserId == userId))
        {
            responses.Add(MapToDto(response));
        }

        return responses;
    }

    public async Task<List<ResponseDto>> GetAllResponsesForSurveyAsync(string surveyId)
    {
        var responses = new List<ResponseDto>();

        // Alle Rückmeldungen für diese Umfrage
        await foreach (var response in _responsesTable.QueryAsync<ResponseEntity>(r => r.PartitionKey == surveyId))
        {
            responses.Add(MapToDto(response));
        }

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
                var response = await _responsesTable.GetEntityAsync<ResponseEntity>(request.SurveyId, rowKey);
                existingResponse = response.Value;
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

                await _responsesTable.UpdateEntityAsync(existingResponse, existingResponse.ETag, TableUpdateMode.Replace);
                results.Add(MapToDto(existingResponse));
            }
            else
            {
                // Neue Rückmeldung erstellen
                var entity = new ResponseEntity
                {
                    PartitionKey = request.SurveyId,
                    RowKey = rowKey,
                    SurveyId = request.SurveyId,
                    ServiceDateId = responseRequest.ServiceDateId,
                    UserId = userId,
                    UserName = userName,
                    Availability = responseRequest.Availability.ToString(),
                    Remarks = responseRequest.Remarks,
                    CreatedAt = now,
                    UpdatedAt = now
                };

                await _responsesTable.AddEntityAsync(entity);
                results.Add(MapToDto(entity));
            }
        }

        return results;
    }

    private static ResponseDto MapToDto(ResponseEntity entity)
    {
        return new ResponseDto(
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
