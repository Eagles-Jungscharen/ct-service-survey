using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using EaglesJungscharen.Azure.ChurchToolIDPServices.Extensions;
using GuedesPlace.AzureTools.Configuration.Extensions;
using GuedesPlace.AzureTools.Tables;
using EaglesJungscharen.Azure.ServiceSurvey.Models.Entities;
using EaglesJungscharen.Azure.ServiceSurvey.Services;
using EaglesJungscharen.Azure.ServiceSurvey.Models;
using EaglesJungscharen.Azure.ChurchToolIDPServices.Middleware;
using Microsoft.Azure.Functions.Worker.Builder;
using System.Text.Json;
using System.Text.Json.Serialization;

var builder = FunctionsApplication.CreateBuilder(args);

builder.ConfigureFunctionsWebApplication();

var services = builder.Services;
// Application Insights
services.AddApplicationInsightsTelemetryWorkerService();
services.ConfigureFunctionsApplicationInsights();

builder.Configuration.CheckConfigurationValuesAvailable(new[]
{
            "CHURCHTOOL_URL",
            "OIDC_AUTHORITY_URL",
            "CHURCHTOOL_IDP_STORAGE_CONNECTION_STRING",
            "CHURCHTOOL_ADMIN_GROUP_ID",
            "AzureWebJobsStorage",
        });
var configuration = builder.Configuration;
// ChurchTools IDP Services
var churchToolUrl = configuration["CHURCHTOOL_URL"]
    ?? throw new InvalidOperationException("CHURCHTOOL_URL is not configured.");
var oidcAuthorityUrl = configuration["OIDC_AUTHORITY_URL"]
    ?? throw new InvalidOperationException("OIDC_AUTHORITY_URL is not configured.");
var idpStorageConnectionString = configuration["CHURCHTOOL_IDP_STORAGE_CONNECTION_STRING"]
    ?? throw new InvalidOperationException("CHURCHTOOL_IDP_STORAGE_CONNECTION_STRING is not configured.");

services.Configure<ServiceSurveyConfiguration>(config =>
{
    config.ChurchToolAdminGroupId = configuration["CHURCHTOOL_ADMIN_GROUP_ID"]!;
});

services.AddChurchToolIDPServices(
    churchToolUrl: churchToolUrl,
    oidcAuthorityUrl: oidcAuthorityUrl,
    churchToolIDPStorageConnectionString: idpStorageConnectionString
);

// Azure Table Storage for Survey Data
var surveyStorageConnectionString = configuration["AzureWebJobsStorage"]
    ?? throw new InvalidOperationException("AzureWebJobsStorage is not configured.");

var surveyTableService = new ExtendedAzureTableClientService(surveyStorageConnectionString);

// Register tables (will be created if they don't exist)
var surveysTable = surveyTableService.CreateAndRegisterTableClient<SurveyEntity>("Surveys");
var serviceDatesTable = surveyTableService.CreateAndRegisterTableClient<ServiceDateEntity>("ServiceDates");
var responsesTable = surveyTableService.CreateAndRegisterTableClient<ResponseEntity>("Responses");
var assignmentsTable = surveyTableService.CreateAndRegisterTableClient<AssignmentEntity>("Assignments");
var servicesTable = surveyTableService.CreateAndRegisterTableClient<ServiceEntity>("Services");

// Register individual TableClients as Keyed Services
services.AddKeyedSingleton("SurveyStorage", surveyTableService);

// Register Services
services.AddScoped<ISurveyService, SurveyService>();
services.AddScoped<IResponseService, ResponseService>();
services.AddScoped<IAssignmentService, AssignmentService>();
services.AddScoped<IMeService, MeService>();
services.AddScoped<IChurchToolsService, ChurchToolsService>();
builder.UseMiddleware<JwtValidationMiddleware>();
builder.UseMiddleware<ChurchToolReferenceMiddleware>();

builder.Build().Run();
