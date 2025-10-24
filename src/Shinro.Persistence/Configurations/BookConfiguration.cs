using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Shinro.Domain.Entities;

namespace Shinro.Persistence.Configurations;

internal sealed class BookConfiguration : IEntityTypeConfiguration<Book>
{
    public void Configure(EntityTypeBuilder<Book> builder)
    {
        builder.ToTable(nameof(Book));

        builder.Property(b => b.Isbn).IsRequired(false).HasMaxLength(20);
        builder.Property(b => b.Author).IsRequired(false).HasMaxLength(255);
        builder.Property(b => b.PageCount).IsRequired(false);

        builder.Property(rt => rt.UserId).IsRequired();
        builder.HasOne(rt => rt.User)
            .WithMany(u => u.Books)
            .HasForeignKey(rt => rt.UserId)
            .OnDelete(DeleteBehavior.ClientCascade);
    }
}
