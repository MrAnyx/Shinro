using System;

namespace Shinro.Presentation.Models.Books;

public sealed record BookResponse(
    Guid Id,
    string Title,
    string? Description,
    DateOnly? ReleasedAt,
    double? Rating,
    string? Isbn,
    string? Author,
    uint? PageCount,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt
);
