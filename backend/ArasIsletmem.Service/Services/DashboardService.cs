using System;
using System.Linq;
using System.Threading.Tasks;
using ArasIsletmem.Core.DTOs;
using ArasIsletmem.Core.Entities;
using ArasIsletmem.Core.Enums;
using ArasIsletmem.Core.Repositories;
using ArasIsletmem.Core.Services;

namespace ArasIsletmem.Service.Services;

public class DashboardService : IDashboardService
{
    private readonly IRepository<Order> _orderRepository;
    private readonly IRepository<Wallet> _walletRepository;
    private readonly IRepository<Customer> _customerRepository;

    public DashboardService(
        IRepository<Order> orderRepository,
        IRepository<Wallet> walletRepository,
        IRepository<Customer> customerRepository)
    {
        _orderRepository = orderRepository;
        _walletRepository = walletRepository;
        _customerRepository = customerRepository;
    }

    public async Task<DashboardResponseDto> GetSellerDashboardAsync(Guid sellerId)
    {
        // Satıcıya ait tüm siparişleri getir
        var allOrders = await _orderRepository.FindAsync(o => o.SellerId == sellerId);
        var ordersList = allOrders.ToList();

        // Cüzdan bilgilerini getir
        var wallets = await _walletRepository.FindAsync(w => w.SellerId == sellerId);
        var wallet = wallets.FirstOrDefault();

        // Müşteri bilgilerini getir (son siparişlerde isim göstermek için)
        var customerIds = ordersList.Select(o => o.CustomerId).Distinct().ToList();
        var allCustomers = await _customerRepository.GetAllAsync();
        var customerDict = allCustomers
            .Where(c => customerIds.Contains(c.Id))
            .ToDictionary(c => c.Id, c => $"{c.FirstName} {c.LastName}");

        // Sayaçları hesapla
        var totalSales = ordersList
            .Where(o => o.OrderStatus == OrderStatus.Delivered)
            .Sum(o => o.TotalAmount);

        var pendingPaymentsCount = ordersList
            .Count(o => o.OrderStatus == OrderStatus.PaymentReceived);

        var cargoRequestedCount = ordersList
            .Count(o => o.OrderStatus == OrderStatus.InCargo);

        // Son 10 siparişi tarih sırasına göre getir
        var recentOrders = ordersList
            .OrderByDescending(o => o.CreatedAt)
            .Take(10)
            .Select(o => new RecentOrderDto
            {
                OrderNumber = o.OrderNumber,
                CustomerName = customerDict.ContainsKey(o.CustomerId)
                    ? customerDict[o.CustomerId]
                    : "Bilinmeyen Müşteri",
                Amount = o.TotalAmount,
                Date = o.CreatedAt,
                Status = o.OrderStatus.ToString(),
                CargoTrackingNumber = o.CargoTrackingNumber
            })
            .ToList();

        // Son 7 günün günlük satış verisini hesapla (Pazartesi, Salı vb.)
        var today = DateTime.UtcNow.Date;
        var dailySales = new List<DailySaleDto>();
        string[] turkishDays = { "Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt" };

        for (int i = 6; i >= 0; i--)
        {
            var targetDate = today.AddDays(-i);
            var dayName = turkishDays[(int)targetDate.DayOfWeek];

            var dailyTotal = ordersList
                .Where(o => o.CreatedAt.Date == targetDate && o.OrderStatus != OrderStatus.Cancelled)
                .Sum(o => o.TotalAmount);

            dailySales.Add(new DailySaleDto
            {
                DayName = dayName,
                TotalAmount = dailyTotal
            });
        }

        return new DashboardResponseDto
        {
            TotalSales = totalSales,
            TotalOrdersCount = ordersList.Count,
            PendingPaymentsCount = pendingPaymentsCount,
            CargoRequestedCount = cargoRequestedCount,
            AvailableBalance = wallet?.AvailableBalance ?? 0,
            PendingBalance = wallet?.PendingBalance ?? 0,
            RecentOrders = recentOrders,
            DailySales = dailySales
        };
    }
}
