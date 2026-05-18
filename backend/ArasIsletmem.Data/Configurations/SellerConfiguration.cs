using ArasIsletmem.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ArasIsletmem.Data.Configurations;

public class SellerConfiguration : IEntityTypeConfiguration<Seller>
{
    public void Configure(EntityTypeBuilder<Seller> builder)
    {
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.CompanyName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.TaxNumber)
            .HasMaxLength(50);

        builder.Property(x => x.IBAN)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.PhoneNumber)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(x => x.Email)
            .IsRequired()
            .HasMaxLength(100);

        // One-to-One relationship between Seller and Wallet
        builder.HasOne(s => s.Wallet)
            .WithOne(w => w.Seller)
            .HasForeignKey<Wallet>(w => w.SellerId)
            .OnDelete(DeleteBehavior.Cascade);

        // One-to-Many relationship between Seller and Order
        builder.HasMany(s => s.Orders)
            .WithOne(o => o.Seller)
            .HasForeignKey(o => o.SellerId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
