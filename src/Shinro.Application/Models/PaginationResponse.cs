using System.Collections.Generic;

namespace Shinro.Application.Models;

public class PaginatedResponse<T>
{
    public uint PageNumber { get; set; }
    public uint PageSize { get; set; }
    public uint TotalItems { get; set; }
    public uint TotalPages { get; set; }
    public List<T> Items { get; set; } = [];
}
