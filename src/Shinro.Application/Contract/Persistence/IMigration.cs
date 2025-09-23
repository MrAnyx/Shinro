using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Shinro.Application.Contract.Persistence;

public interface IMigration
{
    Task<IEnumerable<string>> GetPendingMigrationsAsync(CancellationToken cancellationToken = default);
    Task MigrateAsync(CancellationToken cancellationToken = default);
}