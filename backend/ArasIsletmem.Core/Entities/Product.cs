using System;
using System.Collections.Generic;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace ArasIsletmem.Core.Entities;

public class Product
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty; // MongoDB ObjectId string representation
    public string SellerId { get; set; } = string.Empty; // Store as string in NoSQL for simplicity or Guid
    public string SellerName { get; set; } = "Lina Atölye";
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public List<string> Images { get; set; } = new List<string>();
    public string? CoverImage { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string SharedLink { get; set; } = string.Empty;

    // Denormalized Category Info
    public string? CategoryId { get; set; }
    public string? CategoryName { get; set; }

    // Denormalized Brand Info
    public string? BrandId { get; set; }
    public string? BrandName { get; set; }

    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
