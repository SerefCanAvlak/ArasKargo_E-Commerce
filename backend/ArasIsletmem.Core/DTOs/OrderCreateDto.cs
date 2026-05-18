namespace ArasIsletmem.Core.DTOs;

public class OrderCreateDto
{
    public string ProductId { get; set; } = string.Empty;
    public Guid CustomerId { get; set; }
    public decimal Amount { get; set; }
}
