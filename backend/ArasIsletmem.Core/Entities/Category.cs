using System;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace ArasIsletmem.Core.Entities;

public class Category
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string Slug { get; set; } = string.Empty;

    public string? ParentCategoryId { get; set; } // Hiyerarşik kategori desteği için opsiyonel üst kategori referansı

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
