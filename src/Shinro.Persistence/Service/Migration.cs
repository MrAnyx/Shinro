using Microsoft.EntityFrameworkCore;
using Shinro.Application.Contract.Persistence;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Shinro.Persistence.Service;

internal sealed class Migration(ApplicationDbContext context) : IMigration
{
    public Task<IEnumerable<string>> GetPendingMigrationsAsync(CancellationToken cancellationToken = default)
    {
        return context.Database.GetPendingMigrationsAsync(cancellationToken);
    }

    public Task MigrateAsync(CancellationToken cancellationToken = default)
    {
        return context.Database.MigrateAsync(cancellationToken);
    }
}