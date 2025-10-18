using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Shinro.Application.Contracts.Persistence;

public interface IMigration
{
    Task<IEnumerable<string>> GetPendingMigrationsAsync(CancellationToken cancellationToken = default);
    Task MigrateAsync(CancellationToken cancellationToken = default);
}