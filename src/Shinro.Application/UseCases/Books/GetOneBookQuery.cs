using FluentValidation;
using Mediator;
using Shinro.Application.Contracts.Persistence.Repository;
using Shinro.Domain.Entities;
using Shinro.Domain.Exceptions.Entity;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Shinro.Application.UseCases.Books;

public sealed class GetOneGookQueryValidator : AbstractValidator<GetOneGookQuery>
{
    public GetOneGookQueryValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
    }
}

public sealed record GetOneGookQuery(Guid Id) : IQuery<Book>;

internal sealed class GetOneGookQueryHandler(IBookRepository bookRepository) : IQueryHandler<GetOneGookQuery, Book>
{
    public async ValueTask<Book> Handle(GetOneGookQuery command, CancellationToken cancellationToken)
    {
        var book = await bookRepository.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new EntityNotFoundException($"Book with id \"{command.Id}\" not found");

        return book;
    }
}
