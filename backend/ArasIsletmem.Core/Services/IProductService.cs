using System.Collections.Generic;
using System.Threading.Tasks;
using ArasIsletmem.Core.DTOs;
using ArasIsletmem.Core.Entities;

namespace ArasIsletmem.Core.Services;

public interface IProductService
{
    Task<string> CreateProductAsync(string sellerId, ProductDto productDto);
    Task<IEnumerable<Product>> GetAllProductsAsync();
    Task<Product?> GetProductByIdAsync(string id);
    Task UpdateProductAsync(string id, ProductDto productDto);
    Task DeleteProductAsync(string id);
}
