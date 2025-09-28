namespace Shinro.Presentation.Contract.Authentication;

public class AccessTokenDTO
{
    public required string AccessToken { get; init; }
    public required string RefreshToken { get; init; }
}
