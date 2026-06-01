using System;
using System.Threading.Tasks;
using ArasIsletmem.Core.Entities;

namespace ArasIsletmem.Core.Services;

public interface IWalletService
{
    Task<Wallet?> GetWalletBySellerIdAsync(Guid sellerId);
    Task TransferPendingToAvailableAsync(Guid sellerId, decimal amount);
}
