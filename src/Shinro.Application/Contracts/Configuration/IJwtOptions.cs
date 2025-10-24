namespace Shinro.Application.Contracts.Configuration;

public interface IJwtOptions
{
    string Secret { get; }
    string Issuer { get; }
    string Audience { get; }
    uint AccessTokenExpirationInMinutes { get; }
}
