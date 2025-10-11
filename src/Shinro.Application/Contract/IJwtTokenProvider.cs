using Shinro.Domain.Entity;

namespace Shinro.Application.Contract;

public interface IJwtTokenProvider
{
    string GenerateAccessToken(User user);
    string GenerateRefreshToken(User user);
}
