using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;
using ArasIsletmem.Core.Repositories;
using ArasIsletmem.Core.Settings;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace ArasIsletmem.Data.Repositories;

public class MongoRepository<T> : IMongoRepository<T> where T : class
{
    private readonly IMongoCollection<T> _collection;

    public MongoRepository(IOptions<MongoDbSettings> settings, string collectionName)
    {
        var client = new MongoClient(settings.Value.ConnectionString);
        var database = client.GetDatabase(settings.Value.DatabaseName);
        _collection = database.GetCollection<T>(collectionName);
    }

    public async Task<T?> GetByIdAsync(string id)
    {
        var filter = Builders<T>.Filter.Eq("Id", id);
        return await _collection.Find(filter).FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<T>> GetAllAsync()
    {
        return await _collection.Find(_ => true).ToListAsync();
    }

    public async Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate)
    {
        return await _collection.Find(predicate).ToListAsync();
    }

    public async Task AddAsync(T entity)
    {
        await _collection.InsertOneAsync(entity);
    }

    public async Task UpdateAsync(string id, T entity)
    {
        var filter = Builders<T>.Filter.Eq("Id", id);
        await _collection.ReplaceOneAsync(filter, entity);
    }

    public async Task RemoveAsync(string id)
    {
        var filter = Builders<T>.Filter.Eq("Id", id);
        await _collection.DeleteOneAsync(filter);
    }

    public async Task<(IEnumerable<T> Items, long TotalCount)> GetPagedAsync(int page, int pageSize, Expression<Func<T, bool>>? predicate = null)
    {
        var filter = predicate != null 
            ? Builders<T>.Filter.Where(predicate) 
            : Builders<T>.Filter.Empty;

        var totalCount = await _collection.CountDocumentsAsync(filter);
        var items = await _collection.Find(filter)
            .Skip((page - 1) * pageSize)
            .Limit(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }
}
