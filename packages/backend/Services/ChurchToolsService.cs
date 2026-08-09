using EaglesJungscharen.Azure.ChurchToolIDPServices.Services;
using EaglesJungscharen.Azure.ServiceSurvey.Models.Dtos;
using Microsoft.Extensions.Logging;

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
}
