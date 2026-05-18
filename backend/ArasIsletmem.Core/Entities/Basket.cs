using System.Collections.Generic;
using System.Linq;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace ArasIsletmem.Core.Entities;

public class Basket
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;
    public string CustomerId { get; set; } = string.Empty;
    public List<BasketItem> Items { get; set; } = new List<BasketItem>();

    [BsonIgnore]
    public decimal TotalPrice => Items.Sum(x => x.UnitPrice * x.Quantity);
}
