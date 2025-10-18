using Microsoft.EntityFrameworkCore;
using Shinro.Domain.Entities;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Shinro.Persistence;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    public DbSet<User> Users { get; set; }
    public DbSet<RefreshToken> RefreshToken { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AssemblyReference).Assembly);

        modelBuilder.HasDefaultSchema("public");

        base.OnModelCreating(modelBuilder);
    }

    public override int SaveChanges()
    {
        UpdateEntriesBeforeSave();
        return base.SaveChanges();
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        UpdateEntriesBeforeSave();
        return base.SaveChangesAsync(cancellationToken);
    }

    private void UpdateEntriesBeforeSave()
    {
        var entries = ChangeTracker
            .Entries<Entity>()
            .Where(e => e.State is EntityState.Added or EntityState.Modified or EntityState.Deleted);

        var now = DateTimeOffset.UtcNow;

        foreach (var entry in entries)
        {
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
