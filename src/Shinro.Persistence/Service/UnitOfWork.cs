using Microsoft.EntityFrameworkCore;
using Shinro.Application.Contract.Persistence;
using Shinro.Domain.Contract;
using Shinro.Domain.Model;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Shinro.Persistence.Service;

public class UnitOfWork(ApplicationDbContext context) : IUnitOfWork
{
    public int SaveChanges()
    {
        UpdateTimestamps();
        GenerateUlid();
        return context.SaveChanges();
    }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        UpdateTimestamps();
        GenerateUlid();
        return context.SaveChangesAsync(cancellationToken);
    }

    private void GenerateUlid()
    {
        var entries = context.ChangeTracker
            .Entries<Entity>()
            .Where(e => e.State is EntityState.Added);

        foreach (var entry in entries)
        {
            if (entry.Entity.Id == Ulid.Empty.ToGuid()) // don’t overwrite if already set
            {
                entry.Entity.Id = Ulid.NewUlid().ToGuid();
            }
        }
    }

    private void UpdateTimestamps()
    {
        var entries = context.ChangeTracker
            .Entries<IHasTimestamps>()
            .Where(e => e.State is EntityState.Added or EntityState.Modified);

        foreach (var entry in entries)
        {
            var entity = entry.Entity;

            var now = DateTime.Now;

            if (entry.State == EntityState.Added)
            {
                entity.CreatedAt = now;
            }

            entity.UpdatedAt = now;
        }
    }
}
