using System.Security.Claims;
using EaglesJungscharen.Azure.ChurchToolIDPServices.Services;
using EaglesJungscharen.Azure.ServiceSurvey.Models;
using EaglesJungscharen.Azure.ServiceSurvey.Models.Dtos;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace EaglesJungscharen.Azure.ServiceSurvey.Services;

public class MeService(
    ChurchToolsClientFactory clientFactory,
    ILogger<MeService> logger,
    IOptions<ServiceSurveyConfiguration> options) : IMeService
{
    private readonly ChurchToolsClientFactory _clientFactory = clientFactory;
    private readonly ILogger<MeService> _logger = logger;
    private readonly ServiceSurveyConfiguration _config = options.Value;

    public async Task<MeDto> GetMeDtoAsync(ClaimsPrincipal user, string userId)
    {
        var firstName = user.FindFirstValue("given_name") ?? userId;
        var lastName = user.FindFirstValue("family_name") ?? "";
        _logger.LogInformation("User Claims: UserId={UserId}, FirstName={FirstName}, LastName={LastName}",
            userId, firstName, lastName);

        var displayName = $"{firstName} {lastName}".Trim();

        var ctClient = _clientFactory.Create();
        var whoamiResponse = await ctClient.Whoami.GetAsWhoamiGetResponseAsync();
        var whoami = whoamiResponse?.Data;
        _logger.LogInformation("CHURCHTOOL WhoAmI: UserId={UserId}, DisplayName={DisplayName}",
            whoami?.Id, whoami != null ? whoami.FirstName + " " + whoami.LastName : "N/A");

        var myGroups = await ctClient.Persons[whoami?.Id ?? 0].Groups.GetAsGroupsGetResponseAsync();
        var groups = myGroups?.Data
            ?.Where(g => !string.IsNullOrEmpty(g.Group?.DomainIdentifier))
            .Select(g => new GroupDto(g.Group!.DomainIdentifier!, g.Group.Title ?? string.Empty))
            .ToList() ?? [];

        groups.ForEach(g => _logger.LogInformation("CHURCHTOOL Group: Id={GroupId}, Name={GroupName}", g.Id, g.Title));

        var isAdmin = groups.Any(g => g.Id == _config.ChurchToolAdminGroupId);

        return new MeDto(userId, displayName, isAdmin, groups);
    }
}
