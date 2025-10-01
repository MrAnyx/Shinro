using Microsoft.EntityFrameworkCore;
using Shinro.Application.Contract.Persistence;
using Shinro.Domain.Exception.Entity;
using Shinro.Domain.Model;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Shinro.Persistence.Service;

internal abstract class Repository<TEntity>(ApplicationDbContext Context) : IRepository<TEntity> where TEntity : Entity
{
    public async Task<IEnumerable<TEntity>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await Context.Set<TEntity>().ToListAsync(cancellationToken);
    }

    public Task<TEntity?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return Context.Set<TEntity>().FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public TEntity Add(TEntity entity)
    {
        var entry = Context.Set<TEntity>().Add(entity);
        return entry.Entity;
    }

    public TEntity Update(TEntity entity)
    {
        var entry = Context.Set<TEntity>().Update(entity);
        return entry.Entity;
    }

    public TEntity Remove(TEntity entity)
    {
        var entry = Context.Set<TEntity>().Remove(entity);
        return entry.Entity;
    }

    public async Task<TEntity> RemoveByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await GetByIdAsync(id, cancellationToken) ?? throw new EntityNotFoundException($"No {typeof(TEntity).Name} found with id {id}");
        var entry = Context.Set<TEntity>().Remove(entity);
        return entry.Entity;
    }

    public async Task<int> CountAllAsync(CancellationToken cancellationToken = default)
    {
        return await Context.Set<TEntity>().CountAsync(cancellationToken);
    }
}