using Mapster;
using Microsoft.Extensions.DependencyInjection;

namespace Shinro.Presentation.Extensions;

public static class PresentationExtension
{
    public static IServiceCollection AddPresentation(this IServiceCollection services)
    {
        TypeAdapterConfig.GlobalSettings.Scan(typeof(AssemblyReference).Assembly);
        TypeAdapterConfig.GlobalSettings.RequireExplicitMapping = true; // Fail if a mapping is missing
        TypeAdapterConfig.GlobalSettings.RequireDestinationMemberSource = true; // Fail if a destination member isn’t mapped
        TypeAdapterConfig.GlobalSettings.Compile();

        return services;
    }
}
