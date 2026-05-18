using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ArasIsletmem.Core.DTOs;
using ArasIsletmem.Core.Entities;
using ArasIsletmem.Core.Repositories;
using ArasIsletmem.Core.Services;

namespace ArasIsletmem.Service.Services;

public class BasketService : IBasketService
{
    private readonly IMongoRepository<Basket> _basketRepository;
    private readonly IMongoRepository<Product> _productRepository;

    public BasketService(IMongoRepository<Basket> basketRepository, IMongoRepository<Product> productRepository)
    {
        _basketRepository = basketRepository;
        _productRepository = productRepository;
    }

    public async Task<Basket> GetBasketAsync(string customerId)
    {
        var baskets = await _basketRepository.FindAsync(x => x.CustomerId == customerId);
        var basket = baskets.FirstOrDefault();

        if (basket == null)
        {
            basket = new Basket
            {
                CustomerId = customerId,
                Items = new List<BasketItem>()
            };
            await _basketRepository.AddAsync(basket);
        }

        return basket;
    }

    public async Task<Basket> AddItemToBasketAsync(string customerId, BasketItemAddDto dto)
    {
        // 1. Ürünü bulalım
        var product = await _productRepository.GetByIdAsync(dto.ProductId);
        if (product == null)
        {
            throw new Exception("Eklenmek istenen ürün bulunamadı.");
        }

        // 2. Müşterinin sepetini getirelim
        var basket = await GetBasketAsync(customerId);

        // 3. Sepette bu ürün zaten var mı bakalım
        var existingItem = basket.Items.FirstOrDefault(x => x.ProductId == dto.ProductId);
        var targetQuantity = dto.Quantity;

        if (existingItem != null)
        {
            targetQuantity += existingItem.Quantity;
        }

        // 4. Stok Kontrolü
        if (product.Stock < targetQuantity)
        {
            throw new Exception($"Yetersiz stok! En fazla {product.Stock} adet ekleyebilirsiniz.");
        }

        // 5. Ürünü sepete ekleyelim veya güncelleyelim
        if (existingItem != null)
        {
            existingItem.Quantity = targetQuantity;
        }
        else
        {
            basket.Items.Add(new BasketItem
            {
                ProductId = product.Id,
                ProductTitle = product.Title,
                UnitPrice = product.Price,
                Quantity = dto.Quantity,
                ImageUrl = product.Images.FirstOrDefault() ?? string.Empty
            });
        }

        // 6. MongoDB'de güncelleyelim
        await _basketRepository.UpdateAsync(basket.Id, basket);
        return basket;
    }

    public async Task<Basket> UpdateItemQuantityAsync(string customerId, string productId, int quantity)
    {
        var basket = await GetBasketAsync(customerId);
        var existingItem = basket.Items.FirstOrDefault(x => x.ProductId == productId);

        if (existingItem == null)
        {
            throw new Exception("Sepette bu ürün bulunamadı.");
        }

        if (quantity <= 0)
        {
            // Adet 0 veya altı ise sepetten çıkar
            basket.Items.Remove(existingItem);
        }
        else
        {
            // Güncel stok kontrolü yapalım
            var product = await _productRepository.GetByIdAsync(productId);
            if (product == null)
            {
                throw new Exception("Ürün bulunamadı.");
            }

            if (product.Stock < quantity)
            {
                throw new Exception($"Yetersiz stok! En fazla {product.Stock} adet yapabilirsiniz.");
            }

            existingItem.Quantity = quantity;
        }

        await _basketRepository.UpdateAsync(basket.Id, basket);
        return basket;
    }

    public async Task<Basket> RemoveItemFromBasketAsync(string customerId, string productId)
    {
        var basket = await GetBasketAsync(customerId);
        var existingItem = basket.Items.FirstOrDefault(x => x.ProductId == productId);

        if (existingItem != null)
        {
            basket.Items.Remove(existingItem);
            await _basketRepository.UpdateAsync(basket.Id, basket);
        }

        return basket;
    }

    public async Task ClearBasketAsync(string customerId)
    {
        var basket = await GetBasketAsync(customerId);
        basket.Items.Clear();
        await _basketRepository.UpdateAsync(basket.Id, basket);
    }
}
