using Microsoft.Extensions.DependencyInjection;
using Shinro.Application.Contract;
using Shinro.Infrastructure.Service;

namespace Shinro.Infrastructure.Extension;

public static class InfrastructureExtension
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        return services
            .AddScoped<IPasswordHasher, PasswordHasher>();
    }
}
