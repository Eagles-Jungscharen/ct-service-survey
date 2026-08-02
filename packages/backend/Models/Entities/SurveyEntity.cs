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
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
