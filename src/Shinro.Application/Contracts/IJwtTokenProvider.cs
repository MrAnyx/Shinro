using Shinro.Domain.Entities;

namespace Shinro.Application.Contracts;

public interface IJwtTokenProvider
{
    string GenerateAccessToken(User user);
    string GenerateRefreshToken();
}
