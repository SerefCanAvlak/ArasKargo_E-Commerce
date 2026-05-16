using System;
using ArasIsletmem.Core.Enums;

namespace ArasIsletmem.Core.Entities;

public class Order : BaseEntity
{
    public string OrderNumber { get; set; } = string.Empty;
    public Guid SellerId { get; set; }
    public string ProductId { get; set; } = string.Empty; // MongoDB ObjectId
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerAddress { get; set; } = string.Empty;
    public string? CargoTrackingNumber { get; set; }
    public decimal TotalAmount { get; set; }
    public OrderStatus OrderStatus { get; set; }

    // Navigation property
    public Seller Seller { get; set; } = null!;
}
