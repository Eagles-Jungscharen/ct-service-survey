using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using System;
using System.Security.Claims;
using System.Threading.Tasks;
using EaglesJungscharen.Azure.ServiceSurvey.Models.Dtos;
using EaglesJungscharen.Azure.ServiceSurvey.Services;
namespace EaglesJungscharen.Azure.ServiceSurvey.Functions;

public abstract class AbstractFunctionBase(ILogger logger, IMemoryCache cache, IMeService meService)
{
    protected readonly ILogger _logger = logger;
    protected readonly IMemoryCache _cache = cache;
    protected readonly IMeService _meService = meService;

    protected async Task<IActionResult> ExecuteAsync(HttpRequest req, Func<HttpRequest, MeDto, Task<IActionResult>> handler)
    {
        var userId = req.HttpContext.User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? req.HttpContext.User.FindFirstValue("sub");

        if (string.IsNullOrWhiteSpace(userId))
            return new ObjectResult(new ErrorRecord("Nicht authentifiziert.", 1001))
            { StatusCode = StatusCodes.Status401Unauthorized };

        var meDto = await FindMeDtoAsync(req, userId);
        try
        {
            return await handler(req, meDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unerwarteter Fehler beim Ausführen eines Admin-Handlers.");
            return new ObjectResult(new ErrorRecord("Ein interner Fehler ist aufgetreten.", 1000))
            { StatusCode = StatusCodes.Status500InternalServerError };
        }
    }
    
    protected async Task<IActionResult> ExecuteAsAdminAsync(HttpRequest req, Func<HttpRequest, MeDto, Task<IActionResult>> handler)
    {
        var userId = req.HttpContext.User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? req.HttpContext.User.FindFirstValue("sub");

        if (string.IsNullOrWhiteSpace(userId))
            return new ObjectResult(new ErrorRecord("Nicht authentifiziert.", 1001))
            { StatusCode = StatusCodes.Status401Unauthorized };

        var meDto = await FindMeDtoAsync(req, userId);
        if (!meDto.IsAdmin)
            return new ObjectResult(new ErrorRecord("Zugriff verweigert. Admin-Berechtigung erforderlich.", 1002))
            { StatusCode = StatusCodes.Status403Forbidden };

        try
        {
            return await handler(req, meDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unerwarteter Fehler beim Ausführen eines Admin-Handlers.");
            return new ObjectResult(new ErrorRecord("Ein interner Fehler ist aufgetreten.", 1000))
            { StatusCode = StatusCodes.Status500InternalServerError };
        }
    }
    private async Task<MeDto> FindMeDtoAsync(HttpRequest req, string userId)
    {
        var cacheKey = $"me_{userId}";
        if (_cache.TryGetValue(cacheKey, out MeDto? cached) && cached is not null)
        {
            _logger.LogInformation("MeDto für Benutzer {UserId} aus Cache geladen.", userId);
            return cached;
        }
        var meDto = await _meService.GetMeDtoAsync(req.HttpContext.User, userId);
        _cache.Set(cacheKey, meDto, TimeSpan.FromMinutes(30));
        return meDto;
    }
}