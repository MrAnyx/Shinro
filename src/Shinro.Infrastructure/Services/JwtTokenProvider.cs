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
    TokenValidationParameters tokenValidationParameters
) : IJwtTokenProvider
{
    public string GenerateAccessToken(User user, RefreshToken refreshToken)
    {
        var secretKey = configuration.GetValue<string>("Jwt:Secret")!;
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));

        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var tokenDescriptor = new SecurityTokenDescriptor()
        {
            Subject = new ClaimsIdentity([
                new Claim(JwtClaimName.Jti, Guid.NewGuid().ToString()),
                new Claim(JwtClaimName.Rtid, refreshToken.Id.ToString()),
                new Claim(JwtClaimName.Sub, user.Id.ToString()),
                new Claim(JwtClaimName.Email, user.Email),
                new Claim(JwtClaimName.Name, user.Username),
            ]),
            Expires = DateTime.UtcNow.AddMinutes(10),
            SigningCredentials = credentials,
            Issuer = configuration.GetValue<string>("Jwt:Issuer")!,
            Audience = configuration.GetValue<string>("Jwt:Audience")!,
        };

        var handler = new JwtSecurityTokenHandler();
        var token = handler.CreateToken(tokenDescriptor);
        return handler.WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        return Convert.ToBase64String(RandomNumberGenerator.GetBytes(128));
    }

    public ClaimsPrincipal? GetClaims(string token)
    {
        var tokenHandler = new JwtSecurityTokenHandler();

        try
        {
            var tokenParameters = tokenValidationParameters.Clone();
            tokenParameters.ValidateLifetime = false;
            var principal = tokenHandler.ValidateToken(token, tokenParameters, out var validatedToken);
            return IsJwtWithValidSecurityAlgorithm(validatedToken) ? principal : null;
        }
        catch
        {
            return null;
        }
    }

    private static bool IsJwtWithValidSecurityAlgorithm(SecurityToken validatedToken)
    {
        if (validatedToken is not JwtSecurityToken jwtSecurityToken)
        {
            return false;
        }

        return jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.OrdinalIgnoreCase);
    }

    public bool TryGetClaim(string jwtToken, string claimKey, [NotNullWhen(true)] out string? claimResult)
    {
        claimResult = null;
        var claims = GetClaims(jwtToken);

        if (claims == null)
        {
            return false;
        }

        var claimValue = claims.Claims.FirstOrDefault(c => c.Type == claimKey)?.Value;

        if (claimValue == null)
        {
            return false;
        }

        claimResult = claimValue;
        return true;
    }
}
