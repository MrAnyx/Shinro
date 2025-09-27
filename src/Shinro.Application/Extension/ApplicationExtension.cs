using Microsoft.Extensions.DependencyInjection;

namespace Shinro.Application.Extension;

public static class ApplicationExtension
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        return services
            .AddMediator(options =>
            {
                options.ServiceLifetime = ServiceLifetime.Transient;
                options.Assemblies = [typeof(AssemblyReference).Assembly];
                options.NotificationPublisherType = typeof(Mediator.TaskWhenAllPublisher);
                options.Namespace = "Shinro.Application.SourceGeneration";
            });
    }
}
