using Shinro.Domain.Contract;
using System;

namespace Shinro.Domain.Entity;

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
