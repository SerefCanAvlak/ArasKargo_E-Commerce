namespace ArasIsletmem.Core.Entities;

public class BasketItem
{
    public string ProductId { get; set; } = string.Empty;
    public string ProductTitle { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
}
