using Shinro.Domain.Contracts;
using System;

namespace Shinro.Domain.Entities;

public abstract class Entity : IHasTimestamps
{
    public Guid Id { get; set; }

    #region Timestamps
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    #endregion

    #region Status
    public bool IsDeleted { get; set; }
    #endregion
}
