using System.Text.Json;
using EaglesJungscharen.Azure.ServiceSurvey.Models.Dtos;
using EaglesJungscharen.Azure.ServiceSurvey.Models.Entities;

namespace EaglesJungscharen.Azure.ServiceSurvey.Extensions;

public static class SurveyExtensions
{
    public static SurveyDto MapToDto(this SurveyEntity entity, List<ServiceDateDto> dates)
    {

        return new SurveyDto(
            entity.SurveyId,
            entity.CreatorId,
            entity.CreatorName,
            entity.Title,
            entity.Description,
            entity.ServiceId,
            entity.ServiceName,
            Enum.Parse<SurveyStatus>(entity.Status),
            entity.CreatedAt,
            entity.UpdatedAt,
            dates,
            entity.AccessTag,
            entity.EndDate,
            entity.InvitedPersonIds
        );
    }
}