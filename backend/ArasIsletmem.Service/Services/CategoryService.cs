using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ArasIsletmem.Core.DTOs;
using ArasIsletmem.Core.Entities;
using ArasIsletmem.Core.Repositories;
using ArasIsletmem.Core.Services;

namespace ArasIsletmem.Service.Services;

public class CategoryService : ICategoryService
{
    private readonly IMongoRepository<Category> _categoryRepository;

    public CategoryService(IMongoRepository<Category> categoryRepository)
    {
        _categoryRepository = categoryRepository;
    }

    public async Task<CategoryResponseDto> CreateCategoryAsync(CategoryDto categoryDto)
    {
        if (string.IsNullOrWhiteSpace(categoryDto.Name))
        {
            throw new ArgumentException("Kategori adı boş olamaz.");
        }

        var slug = GenerateSlug(categoryDto.Name);
        var category = new Category
        {
            Name = categoryDto.Name,
            Slug = slug,
            ParentCategoryId = categoryDto.ParentCategoryId,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _categoryRepository.AddAsync(category);

        return MapToResponseDto(category);
    }

    public async Task<IEnumerable<CategoryResponseDto>> GetAllCategoriesAsync()
    {
        var categories = await _categoryRepository.GetAllAsync();
        return categories.Select(MapToResponseDto);
    }

    public async Task<CategoryResponseDto?> GetCategoryByIdAsync(string id)
    {
        var category = await _categoryRepository.GetByIdAsync(id);
        return category == null ? null : MapToResponseDto(category);
    }

    public async Task<CategoryResponseDto> UpdateCategoryAsync(string id, CategoryDto categoryDto)
    {
        var category = await _categoryRepository.GetByIdAsync(id);
        if (category == null)
        {
            throw new KeyNotFoundException("Kategori bulunamadı.");
        }

        if (string.IsNullOrWhiteSpace(categoryDto.Name))
        {
            throw new ArgumentException("Kategori adı boş olamaz.");
        }

        category.Name = categoryDto.Name;
        category.Slug = GenerateSlug(categoryDto.Name);
        category.ParentCategoryId = categoryDto.ParentCategoryId;

        await _categoryRepository.UpdateAsync(id, category);

        return MapToResponseDto(category);
    }

    public async Task DeleteCategoryAsync(string id)
    {
        var category = await _categoryRepository.GetByIdAsync(id);
        if (category == null)
        {
            throw new KeyNotFoundException("Kategori bulunamadı.");
        }

        await _categoryRepository.RemoveAsync(id);
    }

    #region Helper Methods

    private static CategoryResponseDto MapToResponseDto(Category category)
    {
        return new CategoryResponseDto
        {
            Id = category.Id,
            Name = category.Name,
            Slug = category.Slug,
            ParentCategoryId = category.ParentCategoryId,
            IsActive = category.IsActive,
            CreatedAt = category.CreatedAt
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
