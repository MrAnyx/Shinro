using Shinro.Application.Contract;
using Shinro.Domain.Entity;

namespace Shinro.Infrastructure.Service;

internal sealed class JwtTokenProvider : IJwtTokenProvider
{
    public string GenerateAccessToken(User user) => throw new System.NotImplementedException();
    public string GenerateRefreshToken(User user) => throw new System.NotImplementedException();
}
