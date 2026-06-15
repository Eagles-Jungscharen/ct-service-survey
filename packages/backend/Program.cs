using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using EaglesJungscharen.Azure.ChurchToolIDPServices;
using GuedesPlace.AzureTools.Tables;

var host = new HostBuilder()
    .ConfigureFunctionsWebApplication()
    .ConfigureServices((context, services) =>
    {
        // Application Insights
        services.AddApplicationInsightsTelemetryWorkerService();
        services.ConfigureFunctionsApplicationInsights();

        // ChurchTools IDP Services
        var churchToolUrl = context.Configuration["CHURCHTOOL_URL"] 
            ?? throw new InvalidOperationException("CHURCHTOOL_URL is not configured.");
        var oidcAuthorityUrl = context.Configuration["OIDC_AUTHORITY_URL"] 
            ?? throw new InvalidOperationException("OIDC_AUTHORITY_URL is not configured.");
        var idpStorageConnectionString = context.Configuration["CHURCHTOOL_IDP_STORAGE_CONNECTION_STRING"] 
            ?? throw new InvalidOperationException("CHURCHTOOL_IDP_STORAGE_CONNECTION_STRING is not configured.");

        services.AddChurchToolIDPServices(
            churchToolUrl: churchToolUrl,
            oidcAuthorityUrl: oidcAuthorityUrl,
            churchToolIDPStorageConnectionString: idpStorageConnectionString
        );

        // Azure Table Storage for Survey Data
        var surveyStorageConnectionString = context.Configuration["SURVEY_STORAGE_CONNECTION_STRING"] 
            ?? throw new InvalidOperationException("SURVEY_STORAGE_CONNECTION_STRING is not configured.");

        var surveyTableService = new ExtendedAzureTableClientService(surveyStorageConnectionString);
        
        // Register tables (will be created if they don't exist)
        // surveyTableService.CreateAndRegisterTableClient<SurveyEntity>("Surveys");
        // surveyTableService.CreateAndRegisterTableClient<ServiceDateEntity>("ServiceDates");
        // surveyTableService.CreateAndRegisterTableClient<ResponseEntity>("Responses");
        // surveyTableService.CreateAndRegisterTableClient<AssignmentEntity>("Assignments");
        // surveyTableService.CreateAndRegisterTableClient<ServiceEntity>("Services");

        services.AddKeyedSingleton<ExtendedAzureTableClientService>("SurveyStorage", surveyTableService);

        // Register Services
        // services.AddScoped<IMeService, MeService>();
        // services.AddScoped<ISurveyService, SurveyService>();
        // services.AddScoped<IResponseService, ResponseService>();
        // services.AddScoped<IAssignmentService, AssignmentService>();
        // services.AddScoped<IServiceService, ServiceService>();
    })
    .Build();

host.Run();
