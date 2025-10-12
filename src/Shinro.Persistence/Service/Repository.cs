using Microsoft.EntityFrameworkCore;
using Shinro.Application.Contract.Persistence;
using Shinro.Domain.Entity;
using Shinro.Domain.Exception.Entity;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Shinro.Persistence.Service;

internal abstract class Repository<TEntity>(ApplicationDbContext context) : IRepository<TEntity> where TEntity : Entity
{
    protected readonly ApplicationDbContext _context = context;

    public virtual async Task<IEnumerable<TEntity>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Set<TEntity>().ToListAsync(cancellationToken);
    }

    public virtual Task<TEntity?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return _context.Set<TEntity>().FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public virtual TEntity Add(TEntity entity)
    {
        var entry = _context.Set<TEntity>().Add(entity);
        return entry.Entity;
    }

    public virtual TEntity Update(TEntity entity)
    {
        var entry = _context.Set<TEntity>().Update(entity);
        return entry.Entity;
    }

    public virtual TEntity Remove(TEntity entity)
    {
        var entry = _context.Set<TEntity>().Remove(entity);
        return entry.Entity;
    }

    public virtual async Task<TEntity> RemoveByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await GetByIdAsync(id, cancellationToken) ?? throw new EntityNotFoundException($"No type '{typeof(TEntity).Name}' found with id '{id}'");
        var entry = _context.Set<TEntity>().Remove(entity);
        return entry.Entity;
    }

    public virtual async Task<int> CountAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Set<TEntity>().CountAsync(cancellationToken);
    }
}