using FluentValidation;
using Mediator;
using Shinro.Application.Contracts.Persistence.Repository;
using Shinro.Application.Models;
using Shinro.Domain.Entities;
using Shinro.Domain.Enums;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Shinro.Application.UseCases.Books;

public sealed class GetAllBooksQueryValidator : AbstractValidator<GetAllBooksQuery>
{
    public GetAllBooksQueryValidator()
    {
        RuleFor(x => x.PageNumber).GreaterThanOrEqualTo(1);
        RuleFor(x => x.PageSize).InclusiveBetween(1, 1000);
    }
}

public sealed record GetAllBooksQuery(
    int PageNumber = 1,
    int PageSize = 50,
    eSortOrder SortOrder = eSortOrder.Ascending
) : IQuery<(IEnumerable<Book> Books, int TotalCount)>;

internal sealed class GetAllBooksQueryHandler(IBookRepository bookRepository) : IQueryHandler<GetAllBooksQuery, (IEnumerable<Book> Books, int TotalCount)>
{
    public async ValueTask<(IEnumerable<Book> Books, int TotalCount)> Handle(GetAllBooksQuery command, CancellationToken cancellationToken)
    {
        var pagination = new Pagination(command.PageNumber, command.PageSize, command.SortOrder);

        var paginatedResult = await bookRepository.GetAllAsync(pagination, cancellationToken);
        var totalCount = await bookRepository.CountAllAsync(cancellationToken);

        return (paginatedResult, totalCount);
    }
}
