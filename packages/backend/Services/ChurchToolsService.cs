using System.Text.Json;
using EaglesJungscharen.Azure.ChurchToolIDPServices.Services;
using EaglesJungscharen.Azure.ServiceSurvey.Models.Dtos;
using Microsoft.Extensions.Logging;
using Microsoft.Kiota.Serialization;

namespace EaglesJungscharen.Azure.ServiceSurvey.Services;

/// <summary>
/// Service für ChurchTools-Integration (Events und Services)
/// </summary>
public class ChurchToolsService(
    ChurchToolsClientFactory clientFactory,
    ILogger<ChurchToolsService> logger) : IChurchToolsService
{
    private readonly ChurchToolsClientFactory _clientFactory = clientFactory;
    private readonly ILogger<ChurchToolsService> _logger = logger;

    /// <summary>
    /// Holt alle verfügbaren Services (Dienste) aus ChurchTools
    /// </summary>
    public async Task<List<ServiceDto>> FetchServicesAsync()
    {
        _logger.LogInformation("Fetching services from ChurchTools");

        var ctClient = _clientFactory.Create();
        var servicesResponse = await ctClient.Services.GetAsServicesGetResponseAsync();

        if (servicesResponse?.Data == null)
        {
            _logger.LogWarning("No services returned from ChurchTools API");
            return [];
        }

        var services = servicesResponse.Data
            .Where(s => s.Id.HasValue && !string.IsNullOrEmpty(s.Name))
            .Select(s => new ServiceDto(s.Id!.Value, s.Name!))
            .OrderBy(s => s.Name)
            .ToList();

        _logger.LogInformation("Fetched {Count} services from ChurchTools", services.Count);
        return services;
    }

    /// <summary>
    /// Holt Events aus ChurchTools gefiltert nach Zeitraum und Service
    /// </summary>
    public async Task<List<ChurchToolsEventDto>> FetchEventsAsync(DateTime from, DateTime to, int serviceId)
    {
        _logger.LogInformation(
            "Fetching events from ChurchTools: From={From}, To={To}, ServiceId={ServiceId}",
            from, to, serviceId);

        var ctClient = _clientFactory.Create();

        // Query Events mit Zeitraum-Filter und eventServices inkludieren
        var eventsResponse = await ctClient.Events.GetAsEventsGetResponseAsync(config =>
        {
            config.QueryParameters.From = new DateOnly(from.Year, from.Month, from.Day);
            config.QueryParameters.To = new DateOnly(to.Year, to.Month, to.Day);
            config.QueryParameters.Include = "eventServices";
        });

        if (eventsResponse?.Data == null)
        {
            _logger.LogWarning("No events returned from ChurchTools API");
            return [];
        }

        // Filtern: Nur Events die den gesuchten Service in eventServices haben
        var filteredEvents = eventsResponse.Data
            .Where(e => e.Id.HasValue
                && !string.IsNullOrEmpty(e.Name)
                && e.StartDate.HasValue
                && e.EventServices != null
                && e.EventServices.Any(es => es.ServiceId == serviceId))
            .Select(e => new ChurchToolsEventDto(
                e.Id!.Value,
                e.Name!,
                e.StartDate!.Value))
            .OrderBy(e => e.StartDate)
            .ToList();

        _logger.LogInformation(
            "Fetched {TotalCount} events from ChurchTools, {FilteredCount} match serviceId {ServiceId}",
            eventsResponse.Data.Count,
            filteredEvents.Count,
            serviceId);

        return filteredEvents;
    }

    /// <summary>
    /// Sucht Personen in ChurchTools nach Name oder E-Mail
    /// </summary>
    public async Task<List<PersonDto>> SearchPersonsAsync(string query, int maxResults = 10)
    {
        _logger.LogInformation("Searching persons in ChurchTools with query: {Query}", query);

        if (string.IsNullOrWhiteSpace(query))
        {
            return [];
        }

        var ctClient = _clientFactory.Create();

        // Query Personen aus ChurchTools
        var personsResponse = await ctClient.Search.GetAsSearchGetResponseAsync(config =>
        {
            config.QueryParameters.Query = query;
            config.QueryParameters.DomainTypesAsGetDomainTypesQueryParameterType = [Fegmm.ChurchTools.Search.GetDomain_typesQueryParameterType.Person];
        });
        //var personsResponse = await ctClient.Persons.GetAsPersonsGetResponseAsync(config =>
        //{
        //    config.QueryParameters.Limit = maxResults;
        //});

        if (personsResponse?.Data == null)
        {
            _logger.LogWarning("No persons returned from ChurchTools API");
            return [];
        }

        // JSON zu String serialisieren und mit JsonDocument parsen
        var jsonString = await personsResponse.SerializeAsJsonStringAsync();

        using var document = JsonDocument.Parse(jsonString);

        if (!document.RootElement.TryGetProperty("data", out var dataElement))
        {
            _logger.LogWarning("No 'data' property in search response");
            return [];
        }

        // Zu PersonDto mappen
        var persons = dataElement
            .EnumerateArray()
            .Take(maxResults)
            .Select(item =>
            {
                var id = item.GetProperty("domainIdentifier").GetString() ?? "";
                var attrs = item.GetProperty("domainAttributes");
                var firstName = attrs.GetProperty("firstName").GetString() ?? "";
                var lastName = attrs.GetProperty("lastName").GetString() ?? "";

                return new PersonDto(
                    Id: id,
                    Name: $"{firstName} {lastName}",
                    Email: null  // Email ist nicht im Search-Endpoint enthalten
                );
            })
            .ToList();

        _logger.LogInformation("Found {Count} persons matching query: {Query}", persons.Count, query);

        return persons;
    }

    /// <summary>
    /// Hilfsmethode für case-insensitive String-Vergleich
    /// </summary>
    private static bool ContainsIgnoreCase(string source, string value)
    {
        return source.Contains(value, StringComparison.OrdinalIgnoreCase);
    }
}
