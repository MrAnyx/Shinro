using Shinro.Domain.Contracts;
using System;

namespace Shinro.Domain.Entities;

/// <summary>
/// Represent any kind of media item like Book, Movie, Serie, Album, ...
/// </summary>
public abstract class MediaItem : Entity, IHasOwner
{
    public required string Title { get; set; }
    public string? Description { get; set; }
    public DateOnly? ReleasedAt { get; set; }
    public double? Rating { get; set; }

    #region Relationships
    public required Guid UserId { get; set; }
    public User? User { get; set; }
    #endregion
}
