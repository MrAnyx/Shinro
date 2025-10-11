using Microsoft.EntityFrameworkCore;
using Shinro.Domain.Entity;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Shinro.Persistence;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    public DbSet<User> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AssemblyReference).Assembly);

        modelBuilder.HasDefaultSchema("public");

        base.OnModelCreating(modelBuilder);
    }

    public override int SaveChanges()
    {
        HandleSoftDeletes();
        UpdateTimestamps();
        return base.SaveChanges();
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        HandleSoftDeletes();
        UpdateTimestamps();
        return base.SaveChangesAsync(cancellationToken);
    }

    private void HandleSoftDeletes()
    {
        var now = DateTimeOffset.UtcNow;

        var deletedEntries = ChangeTracker
            .Entries<Entity>()
            .Where(e => e.State == EntityState.Deleted);

        foreach (var entry in deletedEntries)
        {
            entry.State = EntityState.Modified;
            entry.Entity.IsDeleted = true;
            entry.Entity.DeletedAt = now;
        }
    }

    private void UpdateTimestamps()
    {
        var entries = ChangeTracker
            .Entries<Entity>()
            .Where(e => e.State is EntityState.Added or EntityState.Modified);

        foreach (var entry in entries)
        {
            var entity = entry.Entity;

            var now = DateTimeOffset.UtcNow;

            if (entry.State == EntityState.Added)
            {
                entity.CreatedAt = now;
            }

            entity.UpdatedAt = now;
        }
    }
}
