using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ArasIsletmem.Core.DTOs;
using ArasIsletmem.Core.Entities;
using ArasIsletmem.Core.Enums;
using ArasIsletmem.Core.Repositories;
using ArasIsletmem.Core.Services;
using ArasIsletmem.Core.UnitOfWorks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.SignalR;
using ArasIsletmem.Service.Hubs;

namespace ArasIsletmem.Service.Services;

public class OrderService : IOrderService
{
    private readonly IRepository<Order> _orderRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IRabbitMqPublisher _rabbitMqPublisher;
    private readonly IMongoRepository<Product> _productRepository;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IRepository<Wallet> _walletRepository;
    private readonly IHubContext<DashboardHub> _hubContext;
    private readonly IDashboardService _dashboardService;

    public OrderService(
        IRepository<Order> orderRepository, 
        IUnitOfWork unitOfWork, 
        IRabbitMqPublisher rabbitMqPublisher,
        IMongoRepository<Product> productRepository,
        IServiceScopeFactory scopeFactory,
        IRepository<Wallet> walletRepository,
        IHubContext<DashboardHub> hubContext,
        IDashboardService dashboardService)
    {
        _orderRepository = orderRepository;
        _unitOfWork = unitOfWork;
        _rabbitMqPublisher = rabbitMqPublisher;
        _productRepository = productRepository;
        _scopeFactory = scopeFactory;
        _walletRepository = walletRepository;
        _hubContext = hubContext;
        _dashboardService = dashboardService;
    }

    public async Task<string> CreateOrderAsync(OrderCreateDto orderDto)
    {
        var customerId = orderDto.CustomerId == Guid.Empty ? Guid.Parse("a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d") : orderDto.CustomerId;

        // Dynamically fetch product seller id
        var product = await _productRepository.GetByIdAsync(orderDto.ProductId);
        if (product == null)
        {
            throw new ArgumentException("Sipariş verilmek istenen ürün bulunamadı.");
        }

        // Stok Kontrolü ve Düşüşü
        var qty = orderDto.Quantity <= 0 ? 1 : orderDto.Quantity;
        if (product.Stock < qty)
        {
            throw new InvalidOperationException($"Yetersiz stok! Mevcut stok: {product.Stock}");
        }

        product.Stock -= qty;
        await _productRepository.UpdateAsync(product.Id, product);

        var sellerId = Guid.Parse("d3b07384-d113-4956-a55e-214545645645"); // default fallback
        if (!string.IsNullOrEmpty(product.SellerId) && Guid.TryParse(product.SellerId, out var parsedGuid))
        {
            sellerId = parsedGuid;
        }

        var order = new Order
        {
            ProductId = orderDto.ProductId,
            CustomerId = customerId,
            TotalAmount = orderDto.Amount,
            OrderNumber = $"#{new Random().Next(1000, 9999)}",
            OrderStatus = OrderStatus.PaymentReceived,
            SellerId = sellerId,
            Quantity = qty
        };

        // Increase Seller Wallet Pending Balance
        var wallets = await _walletRepository.FindAsync(w => w.SellerId == sellerId);
        var wallet = wallets.FirstOrDefault();
        if (wallet == null)
        {
            wallet = new Wallet
            {
                SellerId = sellerId,
                AvailableBalance = 0,
                PendingBalance = orderDto.Amount,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };
            await _walletRepository.AddAsync(wallet);
        }
        else
        {
            wallet.PendingBalance += orderDto.Amount;
            _walletRepository.Update(wallet);
        }

        await _orderRepository.AddAsync(order);
        await _unitOfWork.CommitAsync();

        // Kargo entegrasyonu için kuyruğa mesaj fırlat (Consumer takip no üretecek)
        _rabbitMqPublisher.PublishOrderPlacedEvent(order.Id, order.OrderNumber);

        // Real-time update via SignalR
        try
        {
            var updatedDashboard = await _dashboardService.GetSellerDashboardAsync(sellerId);
            await _hubContext.Clients.Group(sellerId.ToString()).SendAsync("ReceiveDashboardUpdate", updatedDashboard);
        }
        catch {}

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

            try
            {
                var updatedDashboard = await _dashboardService.GetSellerDashboardAsync(order.SellerId);
                await _hubContext.Clients.Group(order.SellerId.ToString()).SendAsync("ReceiveDashboardUpdate", updatedDashboard);
            }
            catch {}
        }
    }

    public async Task<string> CallCourierAsync(Guid orderId)
    {
        var order = await _orderRepository.GetByIdAsync(orderId);
        if (order == null)
            throw new InvalidOperationException("Sipariş bulunamadı.");

        if (order.OrderStatus != OrderStatus.Preparing)
            throw new InvalidOperationException(
                $"Kurye çağırmak için sipariş 'Preparing' durumunda olmalıdır. Mevcut durum: {order.OrderStatus}");

        if (string.IsNullOrEmpty(order.CargoTrackingNumber))
            throw new InvalidOperationException("Henüz kargo takip numarası üretilmemiş. Lütfen biraz bekleyin.");

        order.OrderStatus = OrderStatus.InCargo;
        _orderRepository.Update(order);
        await _unitOfWork.CommitAsync();

        try
        {
            var updatedDashboard = await _dashboardService.GetSellerDashboardAsync(order.SellerId);
            await _hubContext.Clients.Group(order.SellerId.ToString()).SendAsync("ReceiveDashboardUpdate", updatedDashboard);
        }
        catch {}

        // 5 minutes later, automatically mark as Delivered (simulated live flow)
        _ = Task.Run(async () =>
        {
            try
            {
                await Task.Delay(TimeSpan.FromMinutes(5));
                using (var scope = _scopeFactory.CreateScope())
                {
                    var orderRepo = scope.ServiceProvider.GetRequiredService<IRepository<Order>>();
                    var uow = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
                    
                    var delayedOrder = await orderRepo.GetByIdAsync(orderId);
                    if (delayedOrder != null && delayedOrder.OrderStatus == OrderStatus.InCargo)
                    {
                        delayedOrder.OrderStatus = OrderStatus.Delivered;
                        orderRepo.Update(delayedOrder);
                        await uow.CommitAsync();

                        try
                        {
                            var hubContext = scope.ServiceProvider.GetRequiredService<IHubContext<DashboardHub>>();
                            var dashboardService = scope.ServiceProvider.GetRequiredService<IDashboardService>();
                            var updatedDashboard = await dashboardService.GetSellerDashboardAsync(delayedOrder.SellerId);
                            await hubContext.Clients.Group(delayedOrder.SellerId.ToString()).SendAsync("ReceiveDashboardUpdate", updatedDashboard);
                        }
                        catch {}
                    }
                }
            }
            catch
            {
                // Ignore silent background issues
            }
        });

        return order.CargoTrackingNumber;
    }

    public async Task<IEnumerable<Order>> GetOrdersBySellerIdAsync(Guid sellerId)
    {
        return await _orderRepository.FindAsync(o => o.SellerId == sellerId);
    }

    public async Task<IEnumerable<Order>> GetOrdersByCustomerIdAsync(Guid customerId)
    {
        return await _orderRepository.FindAsync(o => o.CustomerId == customerId);
    }
}
