using System;
using System.Collections.Generic;

namespace ArasIsletmem.Core.DTOs;

public class DashboardResponseDto
{
    public decimal TotalSales { get; set; }
    public int TotalOrdersCount { get; set; }
    public int PendingPaymentsCount { get; set; }
    public int CargoRequestedCount { get; set; }
    public decimal AvailableBalance { get; set; }
    public decimal PendingBalance { get; set; }
    public List<RecentOrderDto> RecentOrders { get; set; } = new();
}

public class RecentOrderDto
{
    public string OrderNumber { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? CargoTrackingNumber { get; set; }
}
