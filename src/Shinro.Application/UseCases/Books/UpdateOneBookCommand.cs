using FluentValidation;
using Mediator;
using Shinro.Application.Contracts;
using Shinro.Application.Contracts.Persistence.Repository;
using Shinro.Domain.Entities;
using Shinro.Domain.Exceptions;
using Shinro.Domain.Exceptions.Entity;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Shinro.Application.UseCases.Books;


public sealed class UpdateOneBookCommandValidator : AbstractValidator<UpdateOneBookCommand>
{
    public UpdateOneBookCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty();

        RuleFor(x => x.Title)
            .NotEmpty()
            .MaximumLength(255);

        RuleFor(x => x.Description)
            .MaximumLength(2000);

        RuleFor(x => x.Rating)
            .InclusiveBetween(0, 10);

        RuleFor(x => x.Isbn)
            .MaximumLength(20);

        RuleFor(x => x.Author)
            .MaximumLength(255);
    }
}

public sealed record UpdateOneBookCommand(
    Guid Id,
    string Title,
    string? Description,
    DateOnly? ReleasedAt,
    double? Rating,
    string? Isbn,
    string? Author,
    uint? PageCount
) : ICommand<Book>;

internal sealed class UpdateOneBookCommandHandler(
    IBookRepository bookRepository,
    IJwtTokenProvider jwtTokenProvider
) : ICommandHandler<UpdateOneBookCommand, Book>
{
    public async ValueTask<Book> Handle(UpdateOneBookCommand command, CancellationToken cancellationToken)
    {
        var book = await bookRepository.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new EntityNotFoundException($"Book with id '{command.Id}' not found");

        if (jwtTokenProvider.GetUserId() is not Guid userId)
        {
            throw new UnauthorizedException("User not authenticated. You must login before acessing this ressource");
        }

        if (book.UserId != userId)
        {
            throw new UnauthorizedException("You are not the owner of this resource");
        }

        return book;
    }
}
