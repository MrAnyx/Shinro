using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Shinro.Domain.Entities;

namespace Shinro.Persistence.Configurations;

internal abstract class EntityConfiguration<TEntity> : IEntityTypeConfiguration<TEntity> where TEntity : Entity
{
    public virtual void Configure(EntityTypeBuilder<TEntity> builder)
    {
        // Primary key
        builder.HasKey(e => e.Id);

        // Common timestamps
        builder.Property(e => e.CreatedAt).IsRequired();
        builder.Property(e => e.UpdatedAt).IsRequired();

        // Soft-delete flag
        builder.Property(e => e.DeletedAt).IsRequired(false);
        builder.Property(e => e.IsDeleted).IsRequired().HasDefaultValue(false);

        // Soft-delete global filter
        builder.HasQueryFilter(e => !e.IsDeleted);
    }
}
