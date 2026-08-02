namespace EaglesJungscharen.Azure.ServiceSurvey.Models.Entities;

/// <summary>
/// Table Storage Entity für Benutzer-Rückmeldungen
/// PartitionKey: {surveyId}
/// RowKey: {userId}_{serviceDateId}
/// </summary>
public class ResponseEntity
{
    
    // Business Properties
    public required string ResponseId { get; set; }
    public string SurveyId { get; set; } = string.Empty;
    public string ServiceDateId { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string Availability { get; set; } = "Unknown"; // Yes, No, Maybe, Unknown
    public string Remarks { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
