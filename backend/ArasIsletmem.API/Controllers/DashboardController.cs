using System;
using System.Threading.Tasks;
using ArasIsletmem.Core.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ArasIsletmem.API.Controllers;

[ApiController]
[Route("api/seller")]
[Authorize(Roles = "Seller")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;
    private readonly IWalletService _walletService;

    public DashboardController(IDashboardService dashboardService, IWalletService walletService)
    {
        _dashboardService = dashboardService;
        _walletService = walletService;
    }

    /// <summary>
    /// Satıcı ana sayfasındaki tüm sayaçları, grafikleri ve son siparişleri döndürür.
    /// </summary>
    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        var sellerIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(sellerIdClaim) || !Guid.TryParse(sellerIdClaim, out var sellerId))
        {
            return Unauthorized(new { message = "Satıcı kimliği bulunamadı." });
        }

        var dashboard = await _dashboardService.GetSellerDashboardAsync(sellerId);
        return Ok(dashboard);
    }

    /// <summary>
    /// Satıcının cüzdan bilgilerini döndürür.
    /// </summary>
    [HttpGet("wallet")]
    public async Task<IActionResult> GetWallet()
    {
        var sellerIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(sellerIdClaim) || !Guid.TryParse(sellerIdClaim, out var sellerId))
        {
            return Unauthorized(new { message = "Satıcı kimliği bulunamadı." });
        }

        var wallet = await _walletService.GetWalletBySellerIdAsync(sellerId);
        if (wallet == null)
            return NotFound(new { message = "Cüzdan bulunamadı." });

        return Ok(new
        {
            wallet.AvailableBalance,
            wallet.PendingBalance,
            TotalBalance = wallet.AvailableBalance + wallet.PendingBalance
        });
    }

    /// <summary>
    /// Satıcının çekilebilir bakiyesini banka hesabına aktarır (sıfırlar).
    /// </summary>
    [HttpPost("wallet/withdraw")]
    public async Task<IActionResult> Withdraw()
    {
        var sellerIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(sellerIdClaim) || !Guid.TryParse(sellerIdClaim, out var sellerId))
        {
            return Unauthorized(new { message = "Satıcı kimliği bulunamadı." });
        }

        try
        {
            await _walletService.WithdrawAvailableBalanceAsync(sellerId);
            return Ok(new { message = "Çekilebilir bakiyeniz banka hesabınıza başarıyla aktarıldı." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
