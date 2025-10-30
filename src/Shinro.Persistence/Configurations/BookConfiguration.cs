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

        builder.Property(b => b.UserId).IsRequired();
        builder.HasOne(b => b.User)
            .WithMany(u => u.Books)
            .HasForeignKey(b => b.UserId)
            .OnDelete(DeleteBehavior.ClientCascade);

        builder.Navigation(b => b.User).AutoInclude();
    }
}
