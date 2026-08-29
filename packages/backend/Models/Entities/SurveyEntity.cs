namespace EaglesJungscharen.Azure.ServiceSurvey.Models.Entities;

/// <summary>
/// Table Storage Entity für Umfragen
/// PartitionKey: "Survey"
/// RowKey: {surveyId}
/// </summary>
public class SurveyEntity
{
    // Business Properties
    public string SurveyId { get; set; } = string.Empty;
    public string CreatorId { get; set; } = string.Empty;
    public string CreatorName { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = "Draft"; // Draft, Active, Closed
    public int ServiceId { get; set; } = -1;
    public string ServiceName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Activation-related fields
    public string? AccessTag { get; set; } // 6-stelliger alphanumerischer TAG für öffentlichen Zugriff
    public DateTime? EndDate { get; set; } // Ende-Datum der Umfrage
    public List<string> InvitedPersonIds { get; set; } = [];  // JSON-Array von ChurchTools Person-IDs
}
