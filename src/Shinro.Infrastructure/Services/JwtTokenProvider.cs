using Microsoft.AspNetCore.Http;
using Microsoft.IdentityModel.Tokens;
using Shinro.Application.Contracts;
using Shinro.Application.Contracts.Configuration;
using Shinro.Domain.Entities;
using Shinro.Domain.Enums;
using System;
using System.Diagnostics.CodeAnalysis;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace Shinro.Infrastructure.Services;

internal sealed class JwtTokenProvider(
    IJwtOptions jwtOptions,
    TokenValidationParameters tokenValidationParameters,
    IHttpContextAccessor httpContextAccessor
) : IJwtTokenProvider
{
    private readonly static string SigningAlgorithm = SecurityAlgorithms.HmacSha512;

    public string GenerateAccessToken(User user, RefreshToken refreshToken)
    {
        var secretKey = jwtOptions.Secret;
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));

        var credentials = new SigningCredentials(securityKey, SigningAlgorithm);

        var claims = new[]
        {
            new Claim(JwtClaimName.Jti, Guid.NewGuid().ToString()),
            new Claim(JwtClaimName.Rtid, refreshToken.Id.ToString()),
            new Claim(JwtClaimName.Sub, user.Id.ToString()),
            new Claim(JwtClaimName.Email, user.Email),
            new Claim(JwtClaimName.Name, user.Username)
        };

        var token = new JwtSecurityToken(
            issuer: jwtOptions.Issuer,
            audience: jwtOptions.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(10),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
    public string GenerateRefreshToken() => Convert.ToBase64String(RandomNumberGenerator.GetBytes(128));

    private ClaimsPrincipal? GetClaimsFromContext()
    {
        return httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated == true
            ? httpContextAccessor.HttpContext!.User
            : null;
    }
    private ClaimsPrincipal? GetClaimsFromToken(string token)
    {
        if (TryValidateToken(token, options => options.ValidateLifetime = false, out var claims))
        {
            return claims;
        }

        return null;
    }
    public ClaimsPrincipal? GetClaims(string? token = null)
    {
        if (!string.IsNullOrWhiteSpace(token))
        {
            return GetClaimsFromToken(token);
        }

        return GetClaimsFromContext();
    }

    public bool IsTokenValid(string token, Action<TokenValidationParameters>? configuration = null)
    {
        if (!string.IsNullOrWhiteSpace(token))
        {
            return TryValidateToken(token, configuration, out _);
        }

        return httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated ?? false;
    }

    private bool TryValidateToken(string token, Action<TokenValidationParameters>? configuration, [NotNullWhen(true)] out ClaimsPrincipal? claims)
    {
        claims = null;

        if (string.IsNullOrWhiteSpace(token))
        {
            return false;
        }

        try
        {
            var handler = new JwtSecurityTokenHandler();
            var parameters = tokenValidationParameters.Clone();

            configuration?.Invoke(parameters);

            var principals = handler.ValidateToken(token, parameters, out var validatedToken);

            if (validatedToken is not JwtSecurityToken jwtToken || !jwtToken.Header.Alg.Equals(SigningAlgorithm, StringComparison.OrdinalIgnoreCase))
            {
                return false;
            }

            claims = principals;
            return true;
        }
        catch
        {
            return false;
        }
    }

    public bool TryGetClaim(string? token, string claimKey, [NotNullWhen(true)] out string? claimValue)
    {
        claimValue = GetClaims(token)?.Claims.FirstOrDefault(c => c.Type == claimKey)?.Value;
        return claimValue is not null;
    }

    public string? GetClaimValue(string? token, string claimKey) => TryGetClaim(token, claimKey, out var value) ? value : null;

    public Guid? GetUserId(string? token = null) => Guid.TryParse(GetClaimValue(token, JwtClaimName.Sub), out var id) ? id : null;
    public string? GetEmail(string? token = null) => GetClaimValue(token, JwtClaimName.Email);
    public string? GetUsername(string? token = null) => GetClaimValue(token, JwtClaimName.Name);
    public Guid? GetRefreshTokenId(string? token = null) => Guid.TryParse(GetClaimValue(token, JwtClaimName.Rtid), out var id) ? id : null;
}
