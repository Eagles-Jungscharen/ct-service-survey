using System.Security.Claims;
using Microsoft.Extensions.Configuration;

namespace EaglesJungscharen.Azure.ServiceSurvey.Functions;

/// <summary>
/// Hilfsklasse zum Extrahieren von User-Informationen aus JWT Claims
/// </summary>
public static class UserContextHelper
{
    public static (string userId, string displayName, bool isAdmin)? GetUserFromClaims(
        ClaimsPrincipal? user,
        IConfiguration configuration)
    {
        if (user == null || user.Identity?.IsAuthenticated != true)
            return null;

        var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? user.FindFirst("sub")?.Value
            ?? user.FindFirst("person_id")?.Value;

        var displayName = user.FindFirst(ClaimTypes.Name)?.Value
            ?? user.FindFirst("name")?.Value
            ?? "Unbekannt";

        // Admin-Check: prüfen ob User in Admin-Gruppe
        var adminGroupId = configuration["CHURCHTOOL_ADMIN_GROUP_ID"];
        var groups = user.FindAll("groups").Select(c => c.Value).ToList();
        var isAdmin = !string.IsNullOrEmpty(adminGroupId) && groups.Contains(adminGroupId);

        if (string.IsNullOrEmpty(userId))
            return null;

        return (userId, displayName, isAdmin);
    }
}
