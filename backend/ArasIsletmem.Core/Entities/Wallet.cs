using System;

namespace ArasIsletmem.Core.Entities;

public class Wallet : BaseEntity
{
    public Guid SellerId { get; set; }
    public decimal AvailableBalance { get; set; }
    public decimal PendingBalance { get; set; }

    // Navigation property
    public Seller Seller { get; set; } = null!;
}
