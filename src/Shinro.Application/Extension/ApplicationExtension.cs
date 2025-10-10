using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using Shinro.Application.Behavior;

namespace Shinro.Application.Extension;

public static class ApplicationExtension
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        ValidatorOptions.Global.LanguageManager.Enabled = false;

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
