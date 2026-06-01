using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ArasIsletmem.Core.DTOs;
using ArasIsletmem.Core.Entities;
using ArasIsletmem.Core.Repositories;
using ArasIsletmem.Core.Services;

namespace ArasIsletmem.Service.Services;

public class BrandService : IBrandService
{
    private readonly IMongoRepository<Brand> _brandRepository;

    public BrandService(IMongoRepository<Brand> brandRepository)
    {
        _brandRepository = brandRepository;
    }

    public async Task<BrandResponseDto> CreateBrandAsync(BrandDto brandDto)
    {
        if (string.IsNullOrWhiteSpace(brandDto.Name))
        {
            throw new ArgumentException("Marka adı boş olamaz.");
        }

        var slug = GenerateSlug(brandDto.Name);
        var brand = new Brand
        {
            Name = brandDto.Name,
            Slug = slug,
            LogoUrl = brandDto.LogoUrl,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _brandRepository.AddAsync(brand);

        return MapToResponseDto(brand);
    }

    public async Task<IEnumerable<BrandResponseDto>> GetAllBrandsAsync()
    {
        var brands = await _brandRepository.GetAllAsync();
        return brands.Select(MapToResponseDto);
    }

    public async Task<BrandResponseDto?> GetBrandByIdAsync(string id)
    {
        var brand = await _brandRepository.GetByIdAsync(id);
        return brand == null ? null : MapToResponseDto(brand);
    }

    public async Task<BrandResponseDto> UpdateBrandAsync(string id, BrandDto brandDto)
    {
        var brand = await _brandRepository.GetByIdAsync(id);
        if (brand == null)
        {
            throw new KeyNotFoundException("Marka bulunamadı.");
        }

        if (string.IsNullOrWhiteSpace(brandDto.Name))
        {
            throw new ArgumentException("Marka adı boş olamaz.");
        }

        brand.Name = brandDto.Name;
        brand.Slug = GenerateSlug(brandDto.Name);
        brand.LogoUrl = brandDto.LogoUrl;

        await _brandRepository.UpdateAsync(id, brand);

        return MapToResponseDto(brand);
    }

    public async Task DeleteBrandAsync(string id)
    {
        var brand = await _brandRepository.GetByIdAsync(id);
        if (brand == null)
        {
            throw new KeyNotFoundException("Marka bulunamadı.");
        }

        await _brandRepository.RemoveAsync(id);
    }

    #region Helper Methods

    private static BrandResponseDto MapToResponseDto(Brand brand)
    {
        return new BrandResponseDto
        {
            Id = brand.Id,
            Name = brand.Name,
            Slug = brand.Slug,
            LogoUrl = brand.LogoUrl,
            IsActive = brand.IsActive,
            CreatedAt = brand.CreatedAt
        };
    }

    private string GenerateSlug(string text)
    {
        if (string.IsNullOrEmpty(text)) return string.Empty;
        text = text.ToLowerInvariant();
        text = text.Replace("ş", "s")
                   .Replace("ç", "c")
                   .Replace("ö", "o")
                   .Replace("ğ", "g")
                   .Replace("ü", "u")
                   .Replace("ı", "i");
        text = System.Text.RegularExpressions.Regex.Replace(text, @"[^a-z0-9\s-]", "");
        text = System.Text.RegularExpressions.Regex.Replace(text, @"\s+", " ").Trim();
        text = text.Replace(" ", "-");
        return text + "-" + new Random().Next(100, 999);
    }

    #endregion
}
