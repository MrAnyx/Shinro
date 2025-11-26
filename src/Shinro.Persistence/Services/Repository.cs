using Microsoft.EntityFrameworkCore;
using Shinro.Application.Contracts.Persistence;
using Shinro.Application.Models;
using Shinro.Domain.Entities;
using Shinro.Domain.Enums;
using Shinro.Domain.Exceptions.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Shinro.Persistence.Services;

internal abstract class Repository<TEntity>(ApplicationDbContext context) : IRepository<TEntity> where TEntity : Entity
{
    protected readonly ApplicationDbContext _context = context;

    public virtual async Task<IEnumerable<TEntity>> GetAllAsync(Pagination pagination, CancellationToken cancellationToken = default)
    {
        var query = _context.Set<TEntity>().AsQueryable();

        query = pagination.SortOrder == eSortOrder.Ascending
            ? query.OrderBy(x => x.CreatedAt)
            : query.OrderByDescending(x => x.CreatedAt);

        var items = await query
            .Skip((pagination.PageNumber - 1) * pagination.PageSize)
            .Take(pagination.PageSize)
            .ToListAsync(cancellationToken);

        return items;
    }

    public virtual Task<TEntity?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return _context.Set<TEntity>().FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public virtual async Task<TEntity> AddAsync(TEntity entity)
    {
        var entry = await _context.Set<TEntity>().AddAsync(entity);
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