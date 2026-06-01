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
    private readonly IMongoRepository<Category> _categoryRepository;
    private readonly IMongoRepository<Brand> _brandRepository;

    public ProductService(
        IMongoRepository<Product> productRepository,
        IMongoRepository<Category> categoryRepository,
        IMongoRepository<Brand> brandRepository)
    {
        _productRepository = productRepository;
        _categoryRepository = categoryRepository;
        _brandRepository = brandRepository;
    }

    public async Task<string> CreateProductAsync(string sellerId, ProductDto productDto)
    {
        string? categoryName = null;
        if (!string.IsNullOrEmpty(productDto.CategoryId))
        {
            var category = await _categoryRepository.GetByIdAsync(productDto.CategoryId);
            if (category == null)
            {
                throw new ArgumentException("Geçersiz Kategori ID'si.");
            }
            categoryName = category.Name;
        }

        string? brandName = null;
        if (!string.IsNullOrEmpty(productDto.BrandId))
        {
            var brand = await _brandRepository.GetByIdAsync(productDto.BrandId);
            if (brand == null)
            {
                throw new ArgumentException("Geçersiz Marka ID'si.");
            }
            brandName = brand.Name;
        }

        // Türkçe karakter dostu slug üretimi
        var cleanTitle = productDto.Title.ToLowerInvariant()
            .Replace("ş", "s")
            .Replace("ç", "c")
            .Replace("ö", "o")
            .Replace("ğ", "g")
            .Replace("ü", "u")
            .Replace("ı", "i");
        cleanTitle = System.Text.RegularExpressions.Regex.Replace(cleanTitle, @"[^a-z0-9\s-]", "");
        cleanTitle = System.Text.RegularExpressions.Regex.Replace(cleanTitle, @"\s+", " ").Trim();
        cleanTitle = cleanTitle.Replace(" ", "-");
        var slug = cleanTitle + "-" + new Random().Next(100, 999);

        var product = new Product
        {
            SellerId = sellerId,
            Title = productDto.Title,
            Description = productDto.Description,
            Price = productDto.Price,
            Stock = productDto.Stock,
            Images = productDto.Images,
            Slug = slug,
            SharedLink = $"https://arasisletmem.com/urun/{slug}",
            CategoryId = productDto.CategoryId,
            CategoryName = categoryName,
            BrandId = productDto.BrandId,
            BrandName = brandName
        };

        await _productRepository.AddAsync(product);
        return product.SharedLink;
    }

    public async Task<IEnumerable<Product>> GetAllProductsAsync()
    {
        return await _productRepository.GetAllAsync();
    }

    public async Task<(IEnumerable<Product> Items, long TotalCount)> GetPagedProductsAsync(int page, int pageSize)
    {
        return await _productRepository.GetPagedAsync(page, pageSize);
    }

    public async Task<(IEnumerable<Product> Items, long TotalCount)> GetProductsBySellerPagedAsync(string sellerId, int page, int pageSize)
    {
        return await _productRepository.GetPagedAsync(page, pageSize, x => x.SellerId == sellerId);
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
            string? categoryName = null;
            if (!string.IsNullOrEmpty(productDto.CategoryId))
            {
                var category = await _categoryRepository.GetByIdAsync(productDto.CategoryId);
                if (category == null)
                {
                    throw new ArgumentException("Geçersiz Kategori ID'si.");
                }
                categoryName = category.Name;
            }

            string? brandName = null;
            if (!string.IsNullOrEmpty(productDto.BrandId))
            {
                var brand = await _brandRepository.GetByIdAsync(productDto.BrandId);
                if (brand == null)
                {
                    throw new ArgumentException("Geçersiz Marka ID'si.");
                }
                brandName = brand.Name;
            }

            product.Title = productDto.Title;
            product.Description = productDto.Description;
            product.Price = productDto.Price;
            product.Stock = productDto.Stock;
            product.Images = productDto.Images;
            product.CategoryId = productDto.CategoryId;
            product.CategoryName = categoryName;
            product.BrandId = productDto.BrandId;
            product.BrandName = brandName;

            await _productRepository.UpdateAsync(id, product);
        }
    }

    public async Task DeleteProductAsync(string id)
    {
        await _productRepository.RemoveAsync(id);
    }
}
