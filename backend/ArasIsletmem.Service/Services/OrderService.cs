using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ArasIsletmem.Core.DTOs;
using ArasIsletmem.Core.Entities;
using ArasIsletmem.Core.Enums;
using ArasIsletmem.Core.Repositories;
using ArasIsletmem.Core.Services;
using ArasIsletmem.Core.UnitOfWorks;

namespace ArasIsletmem.Service.Services;

public class OrderService : IOrderService
{
    private readonly IRepository<Order> _orderRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IRabbitMqPublisher _rabbitMqPublisher;

    public OrderService(IRepository<Order> orderRepository, IUnitOfWork unitOfWork, IRabbitMqPublisher rabbitMqPublisher)
    {
        _orderRepository = orderRepository;
        _unitOfWork = unitOfWork;
        _rabbitMqPublisher = rabbitMqPublisher;
    }

    public async Task<string> CreateOrderAsync(OrderCreateDto orderDto)
    {
        var order = new Order
        {
            ProductId = orderDto.ProductId,
            CustomerName = orderDto.CustomerName,
            CustomerAddress = orderDto.CustomerAddress,
            TotalAmount = orderDto.Amount,
            OrderNumber = $"#{new Random().Next(1000, 9999)}",
            OrderStatus = OrderStatus.PaymentReceived,
            SellerId = Guid.Parse("d3b07384-d113-4956-a55e-214545645645") // Mock seller
        };

        await _orderRepository.AddAsync(order);
        await _unitOfWork.CommitAsync();

        _rabbitMqPublisher.PublishOrderMessage(order.OrderNumber, "ARAS-" + Guid.NewGuid().ToString().Substring(0, 8).ToUpper());

        return order.OrderNumber;
    }

    public async Task<IEnumerable<Order>> GetAllOrdersAsync()
    {
        return await _orderRepository.GetAllAsync();
    }

    public async Task<Order?> GetOrderByIdAsync(Guid id)
    {
        return await _orderRepository.GetByIdAsync(id);
    }

    public async Task UpdateOrderStatusAsync(Guid id, OrderStatus status)
    {
        var order = await _orderRepository.GetByIdAsync(id);
        if (order != null)
        {
            order.OrderStatus = status;
            _orderRepository.Update(order);
            await _unitOfWork.CommitAsync();
        }
    }
}
