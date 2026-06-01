using System.Collections.Generic;
using System.Threading.Tasks;
using ArasIsletmem.Core.DTOs;
using ArasIsletmem.Core.Entities;

namespace ArasIsletmem.Core.Services;

public interface ICategoryService
{
    Task<CategoryResponseDto> CreateCategoryAsync(CategoryDto categoryDto);
    Task<IEnumerable<CategoryResponseDto>> GetAllCategoriesAsync();
    Task<CategoryResponseDto?> GetCategoryByIdAsync(string id);
    Task<CategoryResponseDto> UpdateCategoryAsync(string id, CategoryDto categoryDto);
    Task DeleteCategoryAsync(string id);
}
