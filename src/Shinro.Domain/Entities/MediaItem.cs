using System;

namespace Shinro.Domain.Entities;

/// <summary>
/// Represent any kind of media item like Book, Movie, Serie, Album, ...
/// </summary>
public abstract class MediaItem : Entity
{
    public required string Title { get; set; }
    public string? Description { get; set; }

    public DateTimeOffset? ReleasedAt { get; set; }

    public double? Rating { get; set; }
}
