using Shinro.Domain.Enums;

namespace Shinro.Application.Models;

public sealed record Pagination(int PageNumber, int PageSize, eSortOrder SortOrder);