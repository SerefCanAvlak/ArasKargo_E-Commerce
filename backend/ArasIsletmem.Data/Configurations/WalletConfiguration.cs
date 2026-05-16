using ArasIsletmem.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ArasIsletmem.Data.Configurations;

public class WalletConfiguration : IEntityTypeConfiguration<Wallet>
{
    public void Configure(EntityTypeBuilder<Wallet> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.AvailableBalance)
            .HasColumnType("decimal(18,2)");

        builder.Property(x => x.PendingBalance)
            .HasColumnType("decimal(18,2)");
    }
}
