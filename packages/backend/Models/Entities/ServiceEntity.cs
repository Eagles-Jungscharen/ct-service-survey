using Azure;
using Azure.Data.Tables;

namespace EaglesJungscharen.Azure.ServiceSurvey.Models.Entities;

/// <summary>
/// Table Storage Entity für ChurchTools-Dienst-Typen (gecacht)
/// PartitionKey: "Service"
/// RowKey: {serviceId}
/// </summary>
public class ServiceEntity : ITableEntity
{
    public string PartitionKey { get; set; } = "Service";
    public string RowKey { get; set; } = string.Empty; // serviceId
    public DateTimeOffset? Timestamp { get; set; }
    public ETag ETag { get; set; }

    // Business Properties
    public string ServiceId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public DateTime CachedAt { get; set; }
}
