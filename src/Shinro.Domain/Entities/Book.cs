using System;

namespace Shinro.Domain.Entities;

public class Book : MediaItem
{
    public string? Isbn { get; set; }
    public string? Author { get; set; }
    public uint? PageCount { get; set; }

    #region Relationships
    public required Guid UserId { get; set; }
    public User? User { get; set; }
    #endregion
}
