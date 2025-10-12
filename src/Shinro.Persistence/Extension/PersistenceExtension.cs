using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Shinro.Application.Contract.Persistence;
using Shinro.Persistence.Service;

namespace Shinro.Persistence.Extension;

public static class PersistenceExtension
{
    public static IServiceCollection AddPersistence(this IServiceCollection services, IConfiguration configuration)
    {
        return services
            .AddDbContext<ApplicationDbContext>(options => options
                .UseNpgsql(configuration.GetConnectionString("Database"), opt => opt.MigrationsAssembly(typeof(AssemblyReference).Assembly))
            )
            .AddScoped<IMigration, Migration>()
            .AddScoped<IUnitOfWork, UnitOfWork>()
            .Scan(x => x
                .FromAssemblyOf<AssemblyReference>()
                .AddClasses(c => c.AssignableTo(typeof(IRepository<>)), publicOnly: false)
                .AsImplementedInterfaces()
                .WithScopedLifetime()
            )
        ;
    }
}
