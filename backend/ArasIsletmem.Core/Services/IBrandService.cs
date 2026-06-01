using System.Collections.Generic;
using System.Threading.Tasks;
using ArasIsletmem.Core.DTOs;
using ArasIsletmem.Core.Entities;

namespace ArasIsletmem.Core.Services;

public interface IBrandService
{
    Task<BrandResponseDto> CreateBrandAsync(BrandDto brandDto);
    Task<IEnumerable<BrandResponseDto>> GetAllBrandsAsync();
    Task<BrandResponseDto?> GetBrandByIdAsync(string id);
    Task<BrandResponseDto> UpdateBrandAsync(string id, BrandDto brandDto);
    Task DeleteBrandAsync(string id);
}
