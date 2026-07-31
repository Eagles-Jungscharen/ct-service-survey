using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;

namespace EaglesJungscharen.Azure.ServiceSurvey.Functions;

public class HealthFunction(ILogger<HealthFunction> logger)
{
    [Function("Health")]
    public IActionResult Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "health")] HttpRequest req)
    {
        logger.LogInformation("Health check requested.");
        return new OkObjectResult(new { status = "healthy", service = "ct-service-survey" });
    }
}
