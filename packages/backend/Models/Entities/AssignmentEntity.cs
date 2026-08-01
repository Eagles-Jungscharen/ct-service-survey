using Azure;
using Azure.Data.Tables;

namespace EaglesJungscharen.Azure.ServiceSurvey.Models.Entities;

/// <summary>
/// Table Storage Entity für Einteilungen (Admin weist User zu Terminen zu)
/// PartitionKey: {surveyId}
/// RowKey: {serviceDateId}_{userId}
/// </summary>
public class AssignmentEntity : ITableEntity
{
    public string PartitionKey { get; set; } = string.Empty; // surveyId
    public string RowKey { get; set; } = string.Empty; // serviceDateId_userId
    public DateTimeOffset? Timestamp { get; set; }
    public ETag ETag { get; set; }

    // Business Properties
    public string SurveyId { get; set; } = string.Empty;
    public string ServiceDateId { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string AssignedBy { get; set; } = string.Empty; // Admin User ID
    public DateTime AssignedAt { get; set; }
}
