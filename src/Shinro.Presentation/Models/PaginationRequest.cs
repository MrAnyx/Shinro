using Shinro.Domain.Enums;

namespace Shinro.Presentation.Models;

public sealed record PaginationRequest(
    int PageNumber = 1,
    int PageSize = 50,
    eSortOrder SortOrder = eSortOrder.Ascending
);