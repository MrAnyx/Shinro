using Microsoft.Extensions.DependencyInjection;
using Shinro.Application.Contracts;
using Shinro.Infrastructure.Services;

namespace Shinro.Infrastructure.Extensions;

public static class InfrastructureExtension
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        return services
            .AddSingleton<IJwtTokenProvider, JwtTokenProvider>()
            .AddSingleton<IHasher, Hasher>();
    }
}
