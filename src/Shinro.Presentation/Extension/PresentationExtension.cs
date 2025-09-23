using Microsoft.Extensions.DependencyInjection;

namespace Shinro.Presentation.Extension;

public static class PresentationExtension
{
    public static IServiceCollection AddPresentation(this IServiceCollection services)
    {
        return services;
    }
}
