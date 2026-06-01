using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ArasIsletmem.Core.DTOs;
using ArasIsletmem.Core.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ArasIsletmem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BrandsController : ControllerBase
{
    private readonly IBrandService _brandService;

    public BrandsController(IBrandService brandService)
    {
        _brandService = brandService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var brands = await _brandService.GetAllBrandsAsync();
        return Ok(brands);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var brand = await _brandService.GetBrandByIdAsync(id);
        if (brand == null)
        {
            return NotFound(new { message = "Marka bulunamadı." });
        }
        return Ok(brand);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] BrandDto brandDto)
    {
        try
        {
            var createdBrand = await _brandService.CreateBrandAsync(brandDto);
            return CreatedAtAction(nameof(GetById), new { id = createdBrand.Id }, createdBrand);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(string id, [FromBody] BrandDto brandDto)
    {
        try
        {
            var updatedBrand = await _brandService.UpdateBrandAsync(id, brandDto);
            return Ok(updatedBrand);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Marka bulunamadı." });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(string id)
    {
        try
        {
            await _brandService.DeleteBrandAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Marka bulunamadı." });
        }
    }
}
