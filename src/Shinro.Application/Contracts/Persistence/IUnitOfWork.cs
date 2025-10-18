using System.Threading;
using System.Threading.Tasks;

namespace Shinro.Application.Contracts.Persistence;

public interface IUnitOfWork
{
    int SaveChanges();
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
