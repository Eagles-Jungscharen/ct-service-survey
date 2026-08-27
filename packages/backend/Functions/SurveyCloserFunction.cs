using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using EaglesJungscharen.Azure.ServiceSurvey.Models.Entities;
using GuedesPlace.AzureTools.Tables;

namespace EaglesJungscharen.Azure.ServiceSurvey.Functions;

/// <summary>
/// Azure Function zum automatischen Schließen abgelaufener Umfragen
/// Wird stündlich ausgeführt
/// </summary>
public class SurveyCloserFunction([FromKeyedServices("SurveyStorage")] ExtendedAzureTableClientService tableService, ILogger<SurveyCloserFunction> logger)
{
    private readonly TypedAzureTableClient<SurveyEntity> _surveysTable = tableService.GetTypedTableClient<SurveyEntity>();
    private readonly ILogger<SurveyCloserFunction> _logger = logger;

    /// <summary>
    /// Timer Trigger: Läuft stündlich und schließt abgelaufene Umfragen
    /// Cron: "0 0 * * * *" = Jede volle Stunde
    /// </summary>
    [Function("SurveyCloser")]
    public async Task Run([TimerTrigger("0 0 * * * *")] object timerInfo)
    {
        _logger.LogInformation("SurveyCloser Function startet um: {Time}", DateTime.UtcNow);

        try
        {
            var now = DateTime.UtcNow;
            var closedCount = 0;

            // Alle Surveys abrufen
            var surveysEntries = await _surveysTable.GetAllAsync("Survey");
            var surveys = surveysEntries.Where(s => s.Entity != null).Select(s => s.Entity).ToList();

            // Filtern: Nur Active Surveys mit abgelaufenem EndDate
            var expiredSurveys = surveys.Where(s =>
                s.Status == "Active" &&
                s.EndDate.HasValue &&
                s.EndDate.Value <= now).ToList();

            _logger.LogInformation("Gefundene abgelaufene Umfragen: {Count}", expiredSurveys.Count);

            // Jeden abgelaufenen Survey schließen
            foreach (var survey in expiredSurveys)
            {
                try
                {
                    survey.Status = "Closed";
                    survey.UpdatedAt = now;

                    await _surveysTable.InsertOrMergeAsync(survey.SurveyId, "Survey", survey);

                    _logger.LogInformation(
                        "Umfrage {SurveyId} ({Title}) wurde automatisch geschlossen. EndDate: {EndDate}",
                        survey.SurveyId,
                        survey.Title,
                        survey.EndDate);

                    closedCount++;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex,
                        "Fehler beim Schließen der Umfrage {SurveyId}",
                        survey.SurveyId);
                }
            }

            _logger.LogInformation(
                "SurveyCloser Function abgeschlossen. {ClosedCount} von {TotalCount} Umfragen geschlossen.",
                closedCount,
                expiredSurveys.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Fehler beim Ausführen der SurveyCloser Function");
        }
    }
}
