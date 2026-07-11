using System.Threading.Tasks;
using ArasIsletmem.Core.DTOs;
using ArasIsletmem.Core.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System.IO;
using System.Linq;
using System.Collections.Generic;
using System;

namespace ArasIsletmem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;

    public ProductsController(IProductService productService)
    {
        _productService = productService;
    }

    [HttpPost]
    [Authorize(Roles = "Seller")]
    public async Task<IActionResult> CreateProduct([FromBody] ProductDto productDto)
    {
        var sellerId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(sellerId))
        {
            return Unauthorized(new { message = "Satıcı kimliği bulunamadı." });
        }

        var sharedLink = await _productService.CreateProductAsync(sellerId, productDto);
        return Created("", new { SharedLink = sharedLink });
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        if (page < 1) page = 1;
        if (pageSize < 1 || pageSize > 100) pageSize = 10;

        var (items, totalCount) = await _productService.GetPagedProductsAsync(page, pageSize);
        var totalPages = (int)System.Math.Ceiling((double)totalCount / pageSize);

        return Ok(new
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
            TotalPages = totalPages
        });
    }

    [HttpGet("seller")]
    [Authorize(Roles = "Seller")]
    public async Task<IActionResult> GetSellerProducts([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var sellerId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(sellerId))
        {
            return Unauthorized(new { message = "Satıcı kimliği bulunamadı." });
        }

        if (page < 1) page = 1;
        if (pageSize < 1 || pageSize > 100) pageSize = 10;

        var (items, totalCount) = await _productService.GetProductsBySellerPagedAsync(sellerId, page, pageSize);
        var totalPages = (int)System.Math.Ceiling((double)totalCount / pageSize);

        return Ok(new
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
            TotalPages = totalPages
        });
    }

    /// <summary>
    /// Müşterinin satın alma linkine tıkladığında ürünü görüntülemesini sağlar.
    /// Auth gerektirmez - herkese açık endpoint.
    /// </summary>
    [HttpGet("link/{slug}")]
    public async Task<IActionResult> GetBySlug(string slug)
    {
        var product = await _productService.GetProductBySlugAsync(slug);
        if (product == null) return NotFound(new { message = "Ürün bulunamadı veya artık aktif değil." });
        return Ok(product);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var product = await _productService.GetProductByIdAsync(id);
        if (product == null) return NotFound();
        return Ok(product);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Seller")]
    public async Task<IActionResult> Update(string id, [FromBody] ProductDto productDto)
    {
        var sellerId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var product = await _productService.GetProductByIdAsync(id);
        
        if (product == null) return NotFound();
        
        if (product.SellerId != sellerId)
        {
            return StatusCode(403, new { message = "Bu ürünü güncelleme yetkiniz yok. Sadece kendi ürünlerinizi güncelleyebilirsiniz." });
        }

        await _productService.UpdateProductAsync(id, productDto);
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Seller")]
    public async Task<IActionResult> Delete(string id)
    {
        var sellerId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var product = await _productService.GetProductByIdAsync(id);
        
        if (product == null) return NotFound();
        
        if (product.SellerId != sellerId)
        {
            return StatusCode(403, new { message = "Bu ürünü silme yetkiniz yok. Sadece kendi ürünlerinizi silebilirsiniz." });
        }

        await _productService.DeleteProductAsync(id);
        return NoContent();
    }

    [HttpPost("upload-images")]
    [Authorize(Roles = "Seller")]
    public async Task<IActionResult> UploadImages(IFormFileCollection files)
    {
        if (files == null || files.Count == 0)
        {
            return BadRequest(new { message = "Lütfen en az bir görsel yükleyin." });
        }

        var uploadedUrls = new List<string>();
        var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "products");

        if (!Directory.Exists(uploadsFolder))
        {
            Directory.CreateDirectory(uploadsFolder);
        }

        foreach (var file in files)
        {
            if (file.Length > 0)
            {
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
                var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (!allowedExtensions.Contains(extension))
                {
                    return BadRequest(new { message = $"Desteklenmeyen dosya formatı: {file.FileName}. Sadece JPG, JPEG, PNG, WEBP yükleyebilirsiniz." });
                }

                if (file.Length > 5 * 1024 * 1024)
                {
                    return BadRequest(new { message = $"Dosya boyutu çok büyük: {file.FileName}. Maksimum dosya boyutu 5MB olmalıdır." });
                }

                var fileName = Guid.NewGuid().ToString() + extension;
                var filePath = Path.Combine(uploadsFolder, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var request = HttpContext.Request;
                var fileUrl = $"{request.Scheme}://{request.Host}/uploads/products/{fileName}";
                uploadedUrls.Add(fileUrl);
            }
        }

        return Ok(new { urls = uploadedUrls });
    }
}
