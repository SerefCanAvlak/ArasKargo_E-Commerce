using System.Collections.Generic;

namespace ArasIsletmem.Core.DTOs;

public class ProductDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public List<string> Images { get; set; } = new List<string>();
}
