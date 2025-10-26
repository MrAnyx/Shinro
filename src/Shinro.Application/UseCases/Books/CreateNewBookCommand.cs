using System;

namespace Shinro.Application.UseCases.Books;

public sealed record CreateNewBookCommand(
    string Title,
    string? Description,
    DateTimeOffset? ReleasedAt,
    string? Isbn,
    string? Author,
    uint? PageCount
);
