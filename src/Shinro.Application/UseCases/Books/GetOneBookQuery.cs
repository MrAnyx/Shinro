using FluentValidation;
using Mediator;
using Shinro.Application.Contracts.Persistence.Repository;
using Shinro.Domain.Entities;
using Shinro.Domain.Exceptions.Entity;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Shinro.Application.UseCases.Books;

public sealed class GetOneBookQueryValidator : AbstractValidator<GetOneBookQuery>
{
    public GetOneBookQueryValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
    }
}

public sealed record GetOneBookQuery(Guid Id) : IQuery<Book>;

internal sealed class GetOneBookQueryHandler(IBookRepository bookRepository) : IQueryHandler<GetOneBookQuery, Book>
{
    public async ValueTask<Book> Handle(GetOneBookQuery command, CancellationToken cancellationToken)
    {
        var book = await bookRepository.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new EntityNotFoundException($"Book with id \"{command.Id}\" not found");

        return book;
    }
}
