namespace ArasIsletmem.Core.DTOs;

public class OrderCreateDto
{
    public string ProductId { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerAddress { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}
