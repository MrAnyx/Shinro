namespace Shinro.Presentation.Models.Authentication;

public sealed record JwtTokenPairResponse(string AccessToken, string RefreshToken);
