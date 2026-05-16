using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ArasIsletmem.Core.UnitOfWorks;
using ArasIsletmem.Data.Contexts;

namespace ArasIsletmem.Data.UnitOfWorks;

public class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _context;

    public UnitOfWork(AppDbContext context)
    {
        _context = context;
    }

    public void Commit()
    {
        _context.SaveChanges();
    }

    public async Task CommitAsync()
    {
        await _context.SaveChangesAsync();
    }
}
