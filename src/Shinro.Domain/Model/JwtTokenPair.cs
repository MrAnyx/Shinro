namespace Shinro.Domain.Model;

public sealed record JwtTokenPair(string AccessToken, string RefreshToken);
