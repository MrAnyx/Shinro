using Shinro.Domain.Enums;

namespace Shinro.Application.Models;

public class PaginationRequest
{
    public int PageNumber { get; set; } = 1;
    public int? PageSize { get; set; }
    public string? SortField { get; set; }
    public eSortOrder? SortOrder { get; set; }
}