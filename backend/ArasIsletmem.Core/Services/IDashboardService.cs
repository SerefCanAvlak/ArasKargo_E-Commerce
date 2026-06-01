using System;
using System.Threading.Tasks;
using ArasIsletmem.Core.DTOs;

namespace ArasIsletmem.Core.Services;

public interface IDashboardService
{
    Task<DashboardResponseDto> GetSellerDashboardAsync(Guid sellerId);
}
