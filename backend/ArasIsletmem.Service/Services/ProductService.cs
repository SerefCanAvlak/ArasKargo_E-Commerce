using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ArasIsletmem.Core.DTOs;
using ArasIsletmem.Core.Entities;
using ArasIsletmem.Core.Repositories;
using ArasIsletmem.Core.Services;

namespace ArasIsletmem.Service.Services;

public class ProductService : IProductService
{
    private readonly IMongoRepository<Product> _productRepository;

    public ProductService(IMongoRepository<Product> productRepository)
    {
        _productRepository = productRepository;
    }

    public async Task<string> CreateProductAsync(string sellerId, ProductDto productDto)
    {
        var slug = productDto.Title.ToLower().Replace(" ", "-") + "-" + new Random().Next(100, 999);
        var product = new Product
        {
            SellerId = sellerId,
            Title = productDto.Title,
            Description = productDto.Description,
            Price = productDto.Price,
            Stock = productDto.Stock,
            Images = productDto.Images,
            Slug = slug,
            SharedLink = $"https://arasisletmem.com/urun/{slug}"
        };

        await _productRepository.AddAsync(product);
        return product.SharedLink;
    }

    public async Task<IEnumerable<Product>> GetAllProductsAsync()
    {
        return await _productRepository.GetAllAsync();
    }

    public async Task<Product?> GetProductByIdAsync(string id)
    {
        return await _productRepository.GetByIdAsync(id);
    }

    public async Task UpdateProductAsync(string id, ProductDto productDto)
    {
        var product = await _productRepository.GetByIdAsync(id);
        if (product != null)
        {
            product.Title = productDto.Title;
            product.Description = productDto.Description;
            product.Price = productDto.Price;
            product.Stock = productDto.Stock;
            product.Images = productDto.Images;
            await _productRepository.UpdateAsync(id, product);
        }
    }

    public async Task DeleteProductAsync(string id)
    {
        await _productRepository.RemoveAsync(id);
    }
}
