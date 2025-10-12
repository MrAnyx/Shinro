using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using Shinro.Application.Contract;
using Shinro.Domain.Entity;
using System;
using System.Security.Claims;
using System.Text;

namespace Shinro.Infrastructure.Service;

internal sealed class JwtTokenProvider(IConfiguration configuration) : IJwtTokenProvider
{
    public string GenerateAccessToken(User user)
    {
        var secretKey = configuration.GetValue<string>("Jwt:Secret")!;
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));

        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var tokenDescriptor = new SecurityTokenDescriptor()
        {
            Subject = new ClaimsIdentity([
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(JwtRegisteredClaimNames.Name, user.Username),
            ]),
            Expires = DateTime.UtcNow.AddMinutes(10),
            SigningCredentials = credentials,
            Issuer = configuration.GetValue<string>("Jwt:Issuer")!,
            Audience = configuration.GetValue<string>("Jwt:Audience")!,
        };

        var handler = new JsonWebTokenHandler();

        var token = handler.CreateToken(tokenDescriptor);

        return token;
    }

    public string GenerateRefreshToken(User user) => throw new System.NotImplementedException();
}
