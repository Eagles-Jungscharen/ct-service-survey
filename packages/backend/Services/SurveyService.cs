using Azure.Data.Tables;
using Microsoft.Extensions.DependencyInjection;
using EaglesJungscharen.Azure.ServiceSurvey.Models.Dtos;
using EaglesJungscharen.Azure.ServiceSurvey.Models.Entities;

namespace EaglesJungscharen.Azure.ServiceSurvey.Services;

/// <summary>
/// Service-Implementierung für Umfragen-Verwaltung
/// </summary>
public class SurveyService : ISurveyService
{
    private readonly TableClient _surveysTable;
    private readonly TableClient _serviceDatesTable;

    public SurveyService(
        [FromKeyedServices("Surveys")] TableClient surveysTable,
        [FromKeyedServices("ServiceDates")] TableClient serviceDatesTable)
    {
        _surveysTable = surveysTable;
        _serviceDatesTable = serviceDatesTable;
    }

    public async Task<List<SurveyDto>> GetSurveysAsync(string userId, bool isAdmin, SurveyStatus? statusFilter = null)
    {
        // Alle Umfragen abrufen
        var surveys = new List<SurveyEntity>();
        await foreach (var survey in _surveysTable.QueryAsync<SurveyEntity>(s => s.PartitionKey == "Survey"))
        {
            surveys.Add(survey);
        }

        // Filtern nach Status und Berechtigung
        var filteredSurveys = surveys.Where(s =>
        {
            // Admin sieht alle Umfragen
            if (isAdmin) return true;

            // User sieht nur Active und Closed
            return s.Status == "Active" || s.Status == "Closed";
        });

        // Optionaler Status-Filter
        if (statusFilter.HasValue)
        {
            var statusString = statusFilter.Value.ToString();
            filteredSurveys = filteredSurveys.Where(s => s.Status == statusString);
        }

        // Für jede Umfrage die Termine laden
        var result = new List<SurveyDto>();
        foreach (var survey in filteredSurveys)
        {
            var dates = await GetServiceDatesForSurveyAsync(survey.SurveyId);
            result.Add(MapToDto(survey, dates));
        }

        return result.OrderByDescending(s => s.CreatedAt).ToList();
    }

    public async Task<SurveyDto?> GetSurveyByIdAsync(string surveyId)
    {
        try
        {
            var survey = await _surveysTable.GetEntityAsync<SurveyEntity>("Survey", surveyId);
            var dates = await GetServiceDatesForSurveyAsync(surveyId);
            return MapToDto(survey.Value, dates);
        }
        catch (global::Azure.RequestFailedException ex) when (ex.Status == 404)
        {
            return null;
        }
    }

    public async Task<SurveyDto> CreateSurveyAsync(CreateSurveyRequest request, string creatorId, string creatorName)
    {
        var surveyId = Guid.NewGuid().ToString();
        var now = DateTime.UtcNow;

        var survey = new SurveyEntity
        {
            RowKey = surveyId,
            SurveyId = surveyId,
            CreatorId = creatorId,
            CreatorName = creatorName,
            Title = request.Title,
            Description = request.Description,
            Status = request.Status.ToString(),
            CreatedAt = now,
            UpdatedAt = now
        };

        await _surveysTable.AddEntityAsync(survey);

        // Termine erstellen
        var dates = new List<ServiceDateDto>();
        foreach (var dateRequest in request.Dates)
        {
            var date = await CreateServiceDateInternalAsync(surveyId, dateRequest);
            dates.Add(date);
        }

        return MapToDto(survey, dates);
    }

    public async Task<SurveyDto?> UpdateSurveyAsync(string surveyId, UpdateSurveyRequest request, string userId, bool isAdmin)
    {
        // Prüfen ob Umfrage existiert
        SurveyEntity survey;
        try
        {
            var response = await _surveysTable.GetEntityAsync<SurveyEntity>("Survey", surveyId);
            survey = response.Value;
        }
        catch (global::Azure.RequestFailedException ex) when (ex.Status == 404)
        {
            return null;
        }

        // Berechtigung prüfen: nur Creator oder Admin
        if (!isAdmin && survey.CreatorId != userId)
        {
            throw new UnauthorizedAccessException("Keine Berechtigung zum Bearbeiten dieser Umfrage.");
        }

        // Status-Änderung prüfen: Closed kann nicht mehr geändert werden (außer Einteilungen)
        if (survey.Status == "Closed" && request.Status != SurveyStatus.Closed)
        {
            throw new InvalidOperationException("Geschlossene Umfragen können nicht wieder geöffnet werden.");
        }

        survey.Title = request.Title;
        survey.Description = request.Description;
        survey.Status = request.Status.ToString();
        survey.UpdatedAt = DateTime.UtcNow;

        await _surveysTable.UpdateEntityAsync(survey, survey.ETag, TableUpdateMode.Replace);

        var dates = await GetServiceDatesForSurveyAsync(surveyId);
        return MapToDto(survey, dates);
    }

    public async Task<bool> DeleteSurveyAsync(string surveyId, string userId, bool isAdmin)
    {
        // Prüfen ob Umfrage existiert
        SurveyEntity survey;
        try
        {
            var response = await _surveysTable.GetEntityAsync<SurveyEntity>("Survey", surveyId);
            survey = response.Value;
        }
        catch (global::Azure.RequestFailedException ex) when (ex.Status == 404)
        {
            return false;
        }

        // Berechtigung prüfen
        if (!isAdmin && survey.CreatorId != userId)
        {
            throw new UnauthorizedAccessException("Keine Berechtigung zum Löschen dieser Umfrage.");
        }

        // Nur Draft kann gelöscht werden
        if (survey.Status != "Draft")
        {
            throw new InvalidOperationException("Nur Entwürfe können gelöscht werden.");
        }

        // Umfrage löschen
        await _surveysTable.DeleteEntityAsync("Survey", surveyId);

        // Termine löschen (Cascade)
        await foreach (var date in _serviceDatesTable.QueryAsync<ServiceDateEntity>(d => d.PartitionKey == surveyId))
        {
            await _serviceDatesTable.DeleteEntityAsync(surveyId, date.RowKey);
        }

        return true;
    }

    public async Task<ServiceDateDto?> AddServiceDateAsync(string surveyId, CreateServiceDateRequest request, string userId, bool isAdmin)
    {
        // Prüfen ob Umfrage existiert
        SurveyEntity survey;
        try
        {
            var response = await _surveysTable.GetEntityAsync<SurveyEntity>("Survey", surveyId);
            survey = response.Value;
        }
        catch (global::Azure.RequestFailedException ex) when (ex.Status == 404)
        {
            return null;
        }

        // Berechtigung prüfen
        if (!isAdmin && survey.CreatorId != userId)
        {
            throw new UnauthorizedAccessException("Keine Berechtigung zum Bearbeiten dieser Umfrage.");
        }

        // Geschlossene Umfragen können nicht bearbeitet werden
        if (survey.Status == "Closed")
        {
            throw new InvalidOperationException("Geschlossene Umfragen können nicht bearbeitet werden.");
        }

        return await CreateServiceDateInternalAsync(surveyId, request);
    }

    public async Task<bool> DeleteServiceDateAsync(string surveyId, string serviceDateId, string userId, bool isAdmin)
    {
        // Prüfen ob Umfrage existiert
        SurveyEntity survey;
        try
        {
            var response = await _surveysTable.GetEntityAsync<SurveyEntity>("Survey", surveyId);
            survey = response.Value;
        }
        catch (global::Azure.RequestFailedException ex) when (ex.Status == 404)
        {
            return false;
        }

        // Berechtigung prüfen
        if (!isAdmin && survey.CreatorId != userId)
        {
            throw new UnauthorizedAccessException("Keine Berechtigung zum Bearbeiten dieser Umfrage.");
        }

        // Geschlossene Umfragen können nicht bearbeitet werden
        if (survey.Status == "Closed")
        {
            throw new InvalidOperationException("Geschlossene Umfragen können nicht bearbeitet werden.");
        }

        // Termin löschen
        try
        {
            await _serviceDatesTable.DeleteEntityAsync(surveyId, serviceDateId);
            return true;
        }
        catch (global::Azure.RequestFailedException ex) when (ex.Status == 404)
        {
            return false;
        }
    }

    // Private Helper-Methoden

    private async Task<List<ServiceDateDto>> GetServiceDatesForSurveyAsync(string surveyId)
    {
        var dates = new List<ServiceDateDto>();
        await foreach (var date in _serviceDatesTable.QueryAsync<ServiceDateEntity>(d => d.PartitionKey == surveyId))
        {
            dates.Add(new ServiceDateDto(
                date.ServiceDateId,
                date.SurveyId,
                date.Date,
                date.ServiceType,
                date.ServiceTypeName,
                date.RequiredPeople,
                date.Notes
            ));
        }
        return dates.OrderBy(d => d.Date).ToList();
    }

    private async Task<ServiceDateDto> CreateServiceDateInternalAsync(string surveyId, CreateServiceDateRequest request)
    {
        var serviceDateId = Guid.NewGuid().ToString();

        // TODO: ServiceTypeName aus ChurchTools-API holen
        // Für MVP: verwenden wir erstmal den ServiceType als Name
        var serviceTypeName = request.ServiceType;

        var entity = new ServiceDateEntity
        {
            PartitionKey = surveyId,
            RowKey = serviceDateId,
            ServiceDateId = serviceDateId,
            SurveyId = surveyId,
            Date = request.Date,
            ServiceType = request.ServiceType,
            ServiceTypeName = serviceTypeName,
            RequiredPeople = request.RequiredPeople,
            Notes = request.Notes
        };

        await _serviceDatesTable.AddEntityAsync(entity);

        return new ServiceDateDto(
            serviceDateId,
            surveyId,
            request.Date,
            request.ServiceType,
            serviceTypeName,
            request.RequiredPeople,
            request.Notes
        );
    }

    private static SurveyDto MapToDto(SurveyEntity entity, List<ServiceDateDto> dates)
    {
        return new SurveyDto(
            entity.SurveyId,
            entity.CreatorId,
            entity.CreatorName,
            entity.Title,
            entity.Description,
            Enum.Parse<SurveyStatus>(entity.Status),
            entity.CreatedAt,
            entity.UpdatedAt,
            dates
        );
    }
}
