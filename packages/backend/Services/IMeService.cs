using System.Security.Claims;
using EaglesJungscharen.Azure.ServiceSurvey.Models.Dtos;

namespace EaglesJungscharen.Azure.ServiceSurvey.Services;

public interface IMeService
{
    Task<MeDto> GetMeDtoAsync(ClaimsPrincipal user, string userId);
}
