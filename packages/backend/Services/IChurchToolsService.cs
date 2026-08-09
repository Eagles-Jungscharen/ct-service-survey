using EaglesJungscharen.Azure.ServiceSurvey.Models.Dtos;

namespace EaglesJungscharen.Azure.ServiceSurvey.Services;

/// <summary>
/// Service für ChurchTools-Integration (Events und Services)
/// </summary>
public interface IChurchToolsService
{
    /// <summary>
    /// Holt alle verfügbaren Services (Dienste) aus ChurchTools
    /// </summary>
    Task<List<ServiceDto>> FetchServicesAsync();

    /// <summary>
    /// Holt Events aus ChurchTools gefiltert nach Zeitraum und Service
    /// </summary>
    /// <param name="from">Start-Datum</param>
    /// <param name="to">End-Datum</param>
    /// <param name="serviceId">Service-ID zum Filtern</param>
    /// <returns>Liste von Events die dem Service zugeordnet sind</returns>
    Task<List<ChurchToolsEventDto>> FetchEventsAsync(DateTime from, DateTime to, int serviceId);
}
