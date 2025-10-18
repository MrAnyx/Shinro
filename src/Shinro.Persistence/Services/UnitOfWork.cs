using Shinro.Application.Contracts.Persistence;
using System.Threading;
using System.Threading.Tasks;

namespace Shinro.Persistence.Services;

internal sealed class UnitOfWork(ApplicationDbContext context) : IUnitOfWork
{
    public int SaveChanges()
    {
        return context.SaveChanges();
    }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return context.SaveChangesAsync(cancellationToken);
    }
}
