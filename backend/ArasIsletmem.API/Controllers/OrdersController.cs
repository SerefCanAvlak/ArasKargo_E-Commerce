using System;
using System.Threading.Tasks;
using ArasIsletmem.Core.DTOs;
using ArasIsletmem.Core.Enums;
using ArasIsletmem.Core.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace ArasIsletmem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] OrderCreateDto orderDto)
    {
        var orderNumber = await _orderService.CreateOrderAsync(orderDto);
        return Accepted(new { OrderNumber = orderNumber, Status = "PaymentReceived" });
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var orders = await _orderService.GetAllOrdersAsync();
        return Ok(orders);
    }

    [HttpGet("seller")]
    [Authorize(Roles = "Seller")]
    public async Task<IActionResult> GetSellerOrders()
    {
        var sellerIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(sellerIdStr) || !Guid.TryParse(sellerIdStr, out var sellerGuid))
        {
            return Unauthorized(new { message = "Satıcı kimliği bulunamadı." });
        }

        var orders = await _orderService.GetOrdersBySellerIdAsync(sellerGuid);
        return Ok(orders);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var order = await _orderService.GetOrderByIdAsync(id);
        if (order == null) return NotFound();
        return Ok(order);
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] OrderStatus status)
    {
        await _orderService.UpdateOrderStatusAsync(id, status);
        return NoContent();
    }

    /// <summary>
    /// Satıcının "Kurye Çağır / Kargo Talebi Oluştur" butonuna basmasıyla tetiklenir.
    /// Siparişi InCargo durumuna geçirir ve Aras Kargo kurye talebi oluşturur.
    /// </summary>
    [HttpPost("{orderId}/call-courier")]
    public async Task<IActionResult> CallCourier(Guid orderId)
    {
        try
        {
            var trackingNumber = await _orderService.CallCourierAsync(orderId);
            return Ok(new
            {
                message = "Kurye talebi alındı. Aras Kargo kapınızdan alacaktır.",
                cargoTrackingNumber = trackingNumber
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

