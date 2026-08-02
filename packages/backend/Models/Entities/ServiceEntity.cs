namespace EaglesJungscharen.Azure.ServiceSurvey.Models.Entities;

/// <summary>
/// Table Storage Entity für ChurchTools-Dienst-Typen (gecacht)
/// PartitionKey: "Service"
/// RowKey: {serviceId}
/// </summary>
public class ServiceEntity
{
    // Business Properties
    public string ServiceId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public DateTime CachedAt { get; set; }
}
