using Azure.Data.Tables;
using EaglesJungscharen.Azure.ServiceSurvey.Models.Entities;
using GuedesPlace.AzureTools.Tables;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace EaglesJungscharen.Azure.ServiceSurvey.Services;

/// <summary>
/// Service zum Generieren eindeutiger 6-stelliger alphanumerischer TAGs für Survey-Zugriff
/// </summary>
public class AccessTagGenerator([FromKeyedServices("SurveyStorage")] ExtendedAzureTableClientService tableService, ILogger<AccessTagGenerator> logger)
{
    private readonly TypedAzureTableClient<SurveyEntity> _surveysTable = tableService.GetTypedTableClient<SurveyEntity>();
    private readonly ILogger<AccessTagGenerator> _logger = logger;
    private const string Characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private const int TagLength = 6;
    private const int MaxRetries = 3;

    /// <summary>
    /// Generiert einen eindeutigen 6-stelligen alphanumerischen TAG
    /// </summary>
    /// <returns>Eindeutiger TAG</returns>
    /// <exception cref="InvalidOperationException">Wenn nach MaxRetries kein eindeutiger TAG gefunden wurde</exception>
    public async Task<string> GenerateUniqueTagAsync()
    {

        for (int attempt = 0; attempt < MaxRetries; attempt++)
        {
            var tag = GenerateRandomTag();

            // Prüfen ob TAG bereits existiert
            var isDuplicate = await IsTagDuplicateAsync(tag);

            if (!isDuplicate)
            {
                _logger.LogInformation("Eindeutiger TAG generiert: {Tag} (Versuch {Attempt})", tag, attempt + 1);
                return tag;
            }

            _logger.LogWarning("TAG-Kollision erkannt: {Tag}, versuche erneut (Versuch {Attempt}/{MaxRetries})", tag, attempt + 1, MaxRetries);
        }

        throw new InvalidOperationException($"Konnte nach {MaxRetries} Versuchen keinen eindeutigen TAG generieren.");
    }

    /// <summary>
    /// Generiert einen zufälligen 6-stelligen TAG
    /// </summary>
    private static string GenerateRandomTag()
    {
        var random = new Random();
        var chars = new char[TagLength];

        for (int i = 0; i < TagLength; i++)
        {
            chars[i] = Characters[random.Next(Characters.Length)];
        }

        return new string(chars);
    }

    /// <summary>
    /// Prüft ob ein TAG bereits in der Datenbank existiert
    /// </summary>
    private async Task<bool> IsTagDuplicateAsync(string tag)
    {
        try
        {
            // Query alle Surveys und prüfe auf AccessTag (case-insensitive)
            // Alle Umfragen abrufen
            var surveysEntries = await _surveysTable.GetAllAsync("Survey");
            var surveys = surveysEntries.Where(s => s.Entity != null).Select(s => s.Entity).ToList();

            foreach (var entity in surveys)
            {
                if (string.Equals(entity.AccessTag, tag, StringComparison.OrdinalIgnoreCase))
                {
                    return true; // TAG existiert bereits
                }
            }

            return false; // TAG ist eindeutig
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Fehler bei TAG-Duplikatsprüfung für TAG: {Tag}", tag);
            throw;
        }
    }
}
