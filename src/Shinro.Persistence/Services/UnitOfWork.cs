using Microsoft.EntityFrameworkCore;
using Shinro.Application.Contracts.Persistence;
using Shinro.Domain.Entities;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Shinro.Persistence.Services;

internal sealed class UnitOfWork(ApplicationDbContext context) : IUnitOfWork
{
    public int SaveChanges()
    {
        UpdateEntriesBeforeSave();
        return context.SaveChanges();
    }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        UpdateEntriesBeforeSave(cancellationToken);
        return context.SaveChangesAsync(cancellationToken);
    }

    private void UpdateEntriesBeforeSave(CancellationToken cancellationToken = default)
    {
        var entries = context.ChangeTracker
            .Entries<Entity>()
            .Where(e => e.State is EntityState.Added or EntityState.Modified or EntityState.Deleted);

        var now = DateTimeOffset.UtcNow;

        foreach (var entry in entries)
        {
            cancellationToken.ThrowIfCancellationRequested();

            var entity = entry.Entity;

            switch (entry.State)
            {
                case EntityState.Added:
                    entity.CreatedAt = now;
                    break;

                case EntityState.Modified:
                    break;

                case EntityState.Deleted:
                    entry.State = EntityState.Modified;
                    entry.Entity.IsDeleted = true;
                    entry.Entity.DeletedAt = now;
                    break;
            }

            entity.UpdatedAt = now;
        }
    }
}
