using System;
using System.Threading.Tasks;
using ArasIsletmem.Core.DTOs;
using ArasIsletmem.Core.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ArasIsletmem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Customer")]
public class BasketsController : ControllerBase
{
    private readonly IBasketService _basketService;

    public BasketsController(IBasketService basketService)
    {
        _basketService = basketService;
    }

    [HttpGet]
    public async Task<IActionResult> GetBasket()
    {
        var customerId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(customerId))
        {
            return Unauthorized(new { message = "Müşteri kimliği bulunamadı." });
        }

        var basket = await _basketService.GetBasketAsync(customerId);
        return Ok(basket);
    }

    [HttpPost("items")]
    public async Task<IActionResult> AddItem([FromBody] BasketItemAddDto itemDto)
    {
        var customerId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(customerId))
        {
            return Unauthorized(new { message = "Müşteri kimliği bulunamadı." });
        }

        try
        {
            var basket = await _basketService.AddItemToBasketAsync(customerId, itemDto);
            return Ok(basket);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("items/{productId}")]
    public async Task<IActionResult> UpdateItemQuantity(string productId, [FromQuery] int quantity)
    {
        var customerId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(customerId))
        {
            return Unauthorized(new { message = "Müşteri kimliği bulunamadı." });
        }

        try
        {
            var basket = await _basketService.UpdateItemQuantityAsync(customerId, productId, quantity);
            return Ok(basket);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("items/{productId}")]
    public async Task<IActionResult> RemoveItem(string productId)
    {
        var customerId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(customerId))
        {
            return Unauthorized(new { message = "Müşteri kimliği bulunamadı." });
        }

        try
        {
            var basket = await _basketService.RemoveItemFromBasketAsync(customerId, productId);
            return Ok(basket);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete]
    public async Task<IActionResult> ClearBasket()
    {
        var customerId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(customerId))
        {
            return Unauthorized(new { message = "Müşteri kimliği bulunamadı." });
        }

        try
        {
            await _basketService.ClearBasketAsync(customerId);
            return Ok(new { message = "Sepet başarıyla temizlendi." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
