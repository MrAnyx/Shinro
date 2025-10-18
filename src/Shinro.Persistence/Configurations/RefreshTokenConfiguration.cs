using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Shinro.Domain.Entities;

namespace Shinro.Persistence.Configurations;

internal sealed class RefreshTokenConfiguration : EntityConfiguration<RefreshToken>
{
    public override void Configure(EntityTypeBuilder<RefreshToken> builder)
    {
        builder.Property(rt => rt.TokenHash).IsRequired().HasMaxLength(500);
        builder.HasIndex(rt => rt.TokenHash).IsUnique();

        builder.Property(rt => rt.ExpiresAt).IsRequired();

        builder.Property(rt => rt.UserId).IsRequired();
        builder.HasOne(rt => rt.User)
            .WithMany(u => u.RefreshTokens)
            .HasForeignKey(rt => rt.UserId)
            .OnDelete(DeleteBehavior.ClientCascade);
    }
}
