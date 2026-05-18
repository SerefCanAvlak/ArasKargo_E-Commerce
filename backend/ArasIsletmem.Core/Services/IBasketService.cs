using System.Threading.Tasks;
using ArasIsletmem.Core.DTOs;
using ArasIsletmem.Core.Entities;

namespace ArasIsletmem.Core.Services;

public interface IBasketService
{
    Task<Basket> GetBasketAsync(string customerId);
    Task<Basket> AddItemToBasketAsync(string customerId, BasketItemAddDto dto);
    Task<Basket> UpdateItemQuantityAsync(string customerId, string productId, int quantity);
    Task<Basket> RemoveItemFromBasketAsync(string customerId, string productId);
    Task ClearBasketAsync(string customerId);
}
