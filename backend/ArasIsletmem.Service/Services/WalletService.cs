using System;
using System.Linq;
using System.Threading.Tasks;
using ArasIsletmem.Core.Entities;
using ArasIsletmem.Core.Repositories;
using ArasIsletmem.Core.Services;
using ArasIsletmem.Core.UnitOfWorks;

namespace ArasIsletmem.Service.Services;

public class WalletService : IWalletService
{
    private readonly IRepository<Wallet> _walletRepository;
    private readonly IUnitOfWork _unitOfWork;

    public WalletService(IRepository<Wallet> walletRepository, IUnitOfWork unitOfWork)
    {
        _walletRepository = walletRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Wallet?> GetWalletBySellerIdAsync(Guid sellerId)
    {
        var wallets = await _walletRepository.FindAsync(w => w.SellerId == sellerId);
        return wallets.FirstOrDefault();
    }

    public async Task TransferPendingToAvailableAsync(Guid sellerId, decimal amount)
    {
        var wallet = await GetWalletBySellerIdAsync(sellerId);
        if (wallet == null)
            throw new InvalidOperationException("Satıcıya ait cüzdan bulunamadı.");

        if (wallet.PendingBalance < amount)
            throw new InvalidOperationException("Bekleyen bakiye yetersiz.");

        wallet.PendingBalance -= amount;
        wallet.AvailableBalance += amount;
        _walletRepository.Update(wallet);
        await _unitOfWork.CommitAsync();
    }
}
