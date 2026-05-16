using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ArasIsletmem.Core.DTOs;
using ArasIsletmem.Core.Entities;
using ArasIsletmem.Core.Enums;

namespace ArasIsletmem.Core.Services;

public interface IOrderService
{
    Task<string> CreateOrderAsync(OrderCreateDto orderDto);
    Task<IEnumerable<Order>> GetAllOrdersAsync();
    Task<Order?> GetOrderByIdAsync(Guid id);
    Task UpdateOrderStatusAsync(Guid id, OrderStatus status);
}
