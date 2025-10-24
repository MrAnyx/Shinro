using Shinro.Domain.Contracts;
using System;

namespace Shinro.Domain.Entities;

public abstract class Entity : IHasTimestamps, ISoftDeletable
{
    public Guid Id { get; set; }

    #region Timestamps
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    #endregion

    #region Soft delete
    public DateTimeOffset? DeletedAt { get; set; }
    public bool IsDeleted { get; set; }
    #endregion
}
