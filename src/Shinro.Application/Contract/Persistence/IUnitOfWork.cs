using System.Threading;
using System.Threading.Tasks;

namespace Shinro.Application.Contract.Persistence;

public interface IUnitOfWork
{
    int SaveChanges();
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
