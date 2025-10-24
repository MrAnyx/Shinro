using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Shinro.Application.Contracts;
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
    IConfiguration configuration,
    TokenValidationParameters tokenValidationParameters,
    IHttpContextAccessor httpContextAccessor
) : IJwtTokenProvider
{
    private readonly static string SigningAlgorithm = SecurityAlgorithms.HmacSha512;

    public string GenerateAccessToken(User user, RefreshToken refreshToken)
    {
        var secretKey = configuration.GetValue<string>("Jwt:Secret")!;
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
            issuer: configuration.GetValue<string>("Jwt:Issuer")!,
            audience: configuration.GetValue<string>("Jwt:Audience")!,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(10),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerateRefreshToken() => Convert.ToBase64String(RandomNumberGenerator.GetBytes(128));

    public ClaimsPrincipal? GetClaims(string? token = null)
    {
        if (!string.IsNullOrWhiteSpace(token))
        {
            return GetValidatedClaims(token, options =>
            {
                options.ValidateLifetime = false;
            });
        }

        var user = httpContextAccessor.HttpContext?.User;
        return user?.Identity?.IsAuthenticated == true ? user : null;
    }

    public bool IsAuthenticatedOrTokenValid(string? token, Action<TokenValidationParameters>? configuration = null)
    {
        if (!string.IsNullOrWhiteSpace(token))
        {
            return GetValidatedClaims(token, configuration) != null;
        }

        return httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated ?? false;
    }

    private ClaimsPrincipal? GetValidatedClaims(string token, Action<TokenValidationParameters>? configuration)
    {
        if (string.IsNullOrWhiteSpace(token))
        {
            return null;
        }

        try
        {
            var handler = new JwtSecurityTokenHandler();
            var parameters = tokenValidationParameters.Clone();

            configuration?.Invoke(parameters);

            var principals = handler.ValidateToken(token, parameters, out var validatedToken);

            if (validatedToken is not JwtSecurityToken jwtToken || !jwtToken.Header.Alg.Equals(SigningAlgorithm, StringComparison.OrdinalIgnoreCase))
            {
                return null;
            }

            return principals;
        }
        catch
        {
            return null;
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
