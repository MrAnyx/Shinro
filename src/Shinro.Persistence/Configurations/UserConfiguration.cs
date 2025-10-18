using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Shinro.Domain.Entities;

namespace Shinro.Persistence.Configurations;

internal sealed class UserConfiguration : EntityConfiguration<User>
{
    public override void Configure(EntityTypeBuilder<User> builder)
    {
        builder.Property(u => u.Email).IsRequired().HasMaxLength(200);
        builder.HasIndex(u => u.Email).IsUnique();

        builder.Property(u => u.Username).IsRequired().HasMaxLength(200);
        builder.HasIndex(u => u.Username).IsUnique();

        builder.Property(u => u.Password).IsRequired().HasMaxLength(255);

        builder.Property(u => u.LastLoginAt).IsRequired(false);
    }
}
