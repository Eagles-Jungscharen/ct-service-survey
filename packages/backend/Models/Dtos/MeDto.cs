namespace EaglesJungscharen.Azure.ServiceSurvey.Models.Dtos;

public record MeDto(
    string UserId,
    string DisplayName,
    bool IsAdmin,
    ICollection<GroupDto> Groups);
