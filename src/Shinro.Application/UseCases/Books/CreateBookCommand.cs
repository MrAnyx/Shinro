using FluentValidation;
using Mediator;
using Shinro.Application.Contracts;
using Shinro.Application.Contracts.Persistence;
using Shinro.Application.Contracts.Persistence.Repository;
using Shinro.Domain.Entities;
using Shinro.Domain.Exceptions;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Shinro.Application.UseCases.Books;


public sealed class CreateBookCommandValidator : AbstractValidator<CreateBookCommand>
{
    public CreateBookCommandValidator()
    {
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

public sealed record CreateBookCommand(
    string Title,
    string? Description,
    DateTimeOffset? ReleasedAt,
    double? Rating,
    string? Isbn,
    string? Author,
    uint? PageCount
) : ICommand<Book>;

internal sealed class CreateBookCommandHandler(
    IUnitOfWork unitOfWork,
    IBookRepository bookRepository,
    IJwtTokenProvider jwtTokenProvider
) : ICommandHandler<CreateBookCommand, Book>
{
    public async ValueTask<Book> Handle(CreateBookCommand command, CancellationToken cancellationToken)
    {
        if (jwtTokenProvider.GetUserId() is not Guid userId)
        {
            throw new UnauthorizedException("User not authenticated. You must login before acessing this ressource.");
        }

        var book = new Book()
        {
            Title = command.Title,
            Description = command.Description,
            ReleasedAt = command.ReleasedAt,
            Rating = command.Rating,
            Isbn = command.Isbn,
            Author = command.Author,
            PageCount = command.PageCount,
            UserId = userId
        };

        bookRepository.Add(book);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return book;
    }
}
