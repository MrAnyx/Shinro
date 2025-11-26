using FluentValidation;
using Mediator;
using Shinro.Application.Contracts.Persistence.Repository;
using Shinro.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Shinro.Application.UseCases.Books;

public sealed class DeleteOneBookCommandValidator : AbstractValidator<DeleteOneBookCommand>
{
    public DeleteOneBookCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
    }
}

public sealed record DeleteOneBookCommand(Guid Id) : ICommand<Book>;

internal sealed class DeleteOneBookCommandHandler(IBookRepository bookRepository) : ICommandHandler<DeleteOneBookCommand, Book>
{
    public async ValueTask<Book> Handle(DeleteOneBookCommand command, CancellationToken cancellationToken)
    {
        var book = await bookRepository.RemoveByIdAsync(command.Id, cancellationToken);

        return book;
    }
}
