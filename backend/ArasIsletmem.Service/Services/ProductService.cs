using System;
using System.Collections.Generic;
using System.Linq;
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
    private readonly IRepository<Seller> _sellerRepository;

    public ProductService(
        IMongoRepository<Product> productRepository,
        IMongoRepository<Category> categoryRepository,
        IMongoRepository<Brand> brandRepository,
        IRepository<Seller> sellerRepository)
    {
        _productRepository = productRepository;
        _categoryRepository = categoryRepository;
        _brandRepository = brandRepository;
        _sellerRepository = sellerRepository;
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

        string sellerName = "Lina Atölye";
        if (Guid.TryParse(sellerId, out var sellerGuid))
        {
            var seller = await _sellerRepository.GetByIdAsync(sellerGuid);
            if (seller != null && !string.IsNullOrEmpty(seller.CompanyName))
            {
                sellerName = seller.CompanyName;
            }
        }

        var product = new Product
        {
            SellerId = sellerId,
            SellerName = sellerName,
            Title = productDto.Title,
            Description = productDto.Description,
            Price = productDto.Price,
            Stock = productDto.Stock,
            Images = productDto.Images,
            CoverImage = productDto.CoverImage,
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
        var products = await _productRepository.GetAllAsync();
        await PopulateSellerNamesAsync(products);
        return products;
    }

    public async Task<(IEnumerable<Product> Items, long TotalCount)> GetPagedProductsAsync(int page, int pageSize)
    {
        var res = await _productRepository.GetPagedAsync(page, pageSize);
        await PopulateSellerNamesAsync(res.Items);
        return res;
    }

    public async Task<(IEnumerable<Product> Items, long TotalCount)> GetProductsBySellerPagedAsync(string sellerId, int page, int pageSize)
    {
        var res = await _productRepository.GetPagedAsync(page, pageSize, x => x.SellerId == sellerId);
        await PopulateSellerNamesAsync(res.Items);
        return res;
    }

    public async Task<Product?> GetProductByIdAsync(string id)
    {
        var product = await _productRepository.GetByIdAsync(id);
        await PopulateSellerNameAsync(product);
        return product;
    }

    public async Task<Product?> GetProductBySlugAsync(string slug)
    {
        var products = await _productRepository.FindAsync(p => p.Slug == slug && p.IsActive);
        var product = products.FirstOrDefault();
        await PopulateSellerNameAsync(product);
        return product;
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
            product.CoverImage = productDto.CoverImage;
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

    private async Task PopulateSellerNameAsync(Product? product)
    {
        if (product == null) return;
        
        string sellerId = product.SellerId;
        if (sellerId == "seller@arasisletmem.com")
        {
            sellerId = "d3b07384-d113-4956-a55e-214545645645";
        }

        if (Guid.TryParse(sellerId, out var sellerGuid))
        {
            var seller = await _sellerRepository.GetByIdAsync(sellerGuid);
            if (seller != null && !string.IsNullOrEmpty(seller.CompanyName))
            {
                product.SellerName = seller.CompanyName;
            }
        }
    }

    private async Task PopulateSellerNamesAsync(IEnumerable<Product>? products)
    {
        if (products == null) return;
        foreach (var product in products)
        {
            await PopulateSellerNameAsync(product);
        }
    }
}
