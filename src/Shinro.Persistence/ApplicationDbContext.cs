using Microsoft.EntityFrameworkCore;
using Shinro.Domain.Entity;

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
}
