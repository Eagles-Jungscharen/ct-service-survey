namespace EaglesJungscharen.Azure.ServiceSurvey.Models.Dtos;

/// <summary>
/// DTO für ein ChurchTools Event
/// </summary>
public record ChurchToolsEventDto(
    int Id,
    string Name,
    DateTimeOffset StartDate);

/// <summary>
/// Request für das Abrufen von Events aus ChurchTools
/// </summary>
public record FetchEventsRequest(
    DateTime StartDate,
    DateTime EndDate,
    int ServiceId);

/// <summary>
/// Response mit Events aus ChurchTools
/// </summary>
public record FetchEventsResponse(
    List<ChurchToolsEventDto> Events);

/// <summary>
/// DTO für eine ChurchTools Person (für Personen-Suche)
/// </summary>
public record PersonDto(
    string Id,
    string Name,
    string? Email);
