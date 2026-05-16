using System;
using System.Collections.Generic;

namespace ArasIsletmem.Core.Entities;

public class Seller : BaseEntity
{
    public string CompanyName { get; set; } = string.Empty;
    public string? TaxNumber { get; set; }
    public string IBAN { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    
    // Navigation properties
    public Wallet Wallet { get; set; } = null!;
    public ICollection<Order> Orders { get; set; } = new List<Order>();
}
