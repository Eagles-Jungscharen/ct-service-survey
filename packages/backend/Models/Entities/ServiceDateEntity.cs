using Azure;
using Azure.Data.Tables;

namespace EaglesJungscharen.Azure.ServiceSurvey.Models.Entities;

/// <summary>
/// Table Storage Entity für Dienst-Termine innerhalb einer Umfrage
/// PartitionKey: {surveyId}
/// RowKey: {serviceDateId}
/// </summary>
public class ServiceDateEntity : ITableEntity
{
    public string PartitionKey { get; set; } = string.Empty; // surveyId
    public string RowKey { get; set; } = string.Empty; // serviceDateId
    public DateTimeOffset? Timestamp { get; set; }
    public ETag ETag { get; set; }

    // Business Properties
    public string ServiceDateId { get; set; } = string.Empty;
    public string SurveyId { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public string ServiceType { get; set; } = string.Empty; // ChurchTools Service-ID
    public string ServiceTypeName { get; set; } = string.Empty;
    public int RequiredPeople { get; set; }
    public string Notes { get; set; } = string.Empty;
}
