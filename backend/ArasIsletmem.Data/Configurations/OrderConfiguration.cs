using ArasIsletmem.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ArasIsletmem.Data.Configurations;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("Orders", tb => tb.HasTrigger("TR_UpdateWalletOnOrderDelivery"));

        builder.HasKey(x => x.Id);

        builder.Property(x => x.OrderNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.ProductId)
            .IsRequired()
            .HasMaxLength(50); // MongoDB ObjectId representation

        builder.Property(x => x.CustomerId)
            .IsRequired();

        builder.Property(x => x.CargoTrackingNumber)
            .HasMaxLength(100);

        builder.Property(x => x.TotalAmount)
            .HasColumnType("decimal(18,2)");

        builder.Property(x => x.OrderStatus)
            .IsRequired();
    }
}
