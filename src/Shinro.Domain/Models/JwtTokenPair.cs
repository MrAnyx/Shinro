namespace Shinro.Domain.Models;

public sealed record JwtTokenPair(string AccessToken, string RefreshToken);
