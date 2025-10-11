using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Shinro.Domain.Entity;

namespace Shinro.Persistence.Configuration;

internal abstract class EntityConfiguration<TEntity> : IEntityTypeConfiguration<TEntity> where TEntity : Entity
{
    public virtual void Configure(EntityTypeBuilder<TEntity> builder)
    {
        // Primary key
        builder.HasKey(e => e.Id);

        // Common timestamps
        builder.Property(e => e.CreatedAt).IsRequired();
        builder.Property(e => e.UpdatedAt).IsRequired();
        builder.Property(e => e.DeletedAt).IsRequired(false);

        // Soft-delete flag
        builder.Property(e => e.IsDeleted).IsRequired().HasDefaultValue(false);

        // Soft-delete global filter
        builder.HasQueryFilter(e => !e.IsDeleted);
    }
}
