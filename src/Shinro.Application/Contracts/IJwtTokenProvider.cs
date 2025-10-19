using Shinro.Domain.Entities;
using System.Diagnostics.CodeAnalysis;
using System.Security.Claims;

namespace Shinro.Application.Contracts;

public interface IJwtTokenProvider
{
    string GenerateAccessToken(User user, RefreshToken refreshToken);
    string GenerateRefreshToken();
    ClaimsPrincipal? GetClaims(string jwtToken);
    bool TryGetClaim(string jwtToken, string claimKey, [NotNullWhen(true)] out string? claimResult);
}
