using Microsoft.Extensions.DependencyInjection;

namespace Shinro.Persistence.Extension;

public static class PersistenceExtension
{
    public static IServiceCollection AddPersistence(this IServiceCollection services)
    {
        return services;
    }
}
