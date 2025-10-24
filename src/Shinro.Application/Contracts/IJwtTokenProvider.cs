using Microsoft.IdentityModel.Tokens;
using Shinro.Domain.Entities;
using System;
using System.Diagnostics.CodeAnalysis;
using System.Security.Claims;

namespace Shinro.Application.Contracts;

public interface IJwtTokenProvider
{
    string GenerateAccessToken(User user, RefreshToken refreshToken);
    string GenerateRefreshToken();
    bool IsAuthenticatedOrTokenValid(string? token, Action<TokenValidationParameters>? configuration);
    ClaimsPrincipal? GetClaims(string? token = null);
    bool TryGetClaim(string? token, string claimKey, [NotNullWhen(true)] out string? claimValue);
    string? GetClaimValue(string? token, string claimKey);
    Guid? GetUserId(string? token = null);
    string? GetEmail(string? token = null);
    string? GetUsername(string? token = null);
    Guid? GetRefreshTokenId(string? token = null);
}
