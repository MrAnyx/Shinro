using FluentValidation;
using Mapster;
using Microsoft.Extensions.DependencyInjection;
using Shinro.Application.Behaviors;

namespace Shinro.Application.Extensions;

public static class ApplicationExtension
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        ValidatorOptions.Global.LanguageManager.Enabled = false;

        TypeAdapterConfig.GlobalSettings.Scan(typeof(AssemblyReference).Assembly);
        TypeAdapterConfig.GlobalSettings.RequireExplicitMapping = true; // Fail if a mapping is missing
        TypeAdapterConfig.GlobalSettings.RequireDestinationMemberSource = true; // Fail if a destination member isn’t mapped

        return services
            .AddValidatorsFromAssembly(typeof(AssemblyReference).Assembly, ServiceLifetime.Scoped, includeInternalTypes: true)
            .AddMediator(options =>
            {
                options.ServiceLifetime = ServiceLifetime.Transient;
                options.Assemblies = [typeof(AssemblyReference).Assembly];
                options.NotificationPublisherType = typeof(Mediator.TaskWhenAllPublisher);
                options.Namespace = "Shinro.Application.SourceGeneration";
                options.PipelineBehaviors =
                [
                    typeof(ValidationBehavior<,>)
                ];
            });
    }
}
