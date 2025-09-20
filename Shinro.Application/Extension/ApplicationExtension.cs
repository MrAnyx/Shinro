using Microsoft.Extensions.DependencyInjection;

namespace Shinro.Application.Extension;

public static class ApplicationExtension
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        return services;
    }
}
