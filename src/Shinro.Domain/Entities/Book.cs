namespace Shinro.Domain.Entities;

public class Book : MediaItem
{
    public string? Isbn { get; set; }
    public string? Author { get; set; }
    public uint? PageCount { get; set; }
}
