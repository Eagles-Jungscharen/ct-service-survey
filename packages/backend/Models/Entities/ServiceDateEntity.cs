namespace EaglesJungscharen.Azure.ServiceSurvey.Models.Entities;

/// <summary>
/// Table Storage Entity für Dienst-Termine innerhalb einer Umfrage
/// PartitionKey: {surveyId}
/// RowKey: {serviceDateId}
/// </summary>
public class ServiceDateEntity
{
    // Business Properties
    public required string ServiceDateId { get; set; }
    public string SurveyId { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public string ServiceType { get; set; } = string.Empty; // ChurchTools Service-ID
    public string ServiceTypeName { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
}
