using Microsoft.Extensions.DependencyInjection;

namespace Shinro.Presentation.Extensions;

public static class PresentationExtension
{
    public static IServiceCollection AddPresentation(this IServiceCollection services)
    {
        return services;
    }
}
