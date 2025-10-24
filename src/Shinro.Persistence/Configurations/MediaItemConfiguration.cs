using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Shinro.Domain.Entities;

namespace Shinro.Persistence.Configurations;

internal sealed class MediaItemConfiguration : EntityConfiguration<MediaItem>
{
    public override void Configure(EntityTypeBuilder<MediaItem> builder)
    {
        base.Configure(builder);

        builder.ToTable(nameof(MediaItem));

        builder.Property(m => m.Title).IsRequired().HasMaxLength(255);
        builder.Property(m => m.Description).IsRequired(false).HasMaxLength(2000);

        builder.Property(m => m.ReleasedAt).IsRequired(false);

        builder.Property(m => m.Rating).IsRequired(false);
    }
}
