using FluentValidation;
using Mediator;
using Shinro.Application.Contract;
using Shinro.Application.Contract.Persistence;
using Shinro.Application.Contract.Persistence.Repository;
using Shinro.Domain.Exception.User;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Shinro.Application.UseCase.User;

public sealed class RegisterCommandValidator : AbstractValidator<RegisterCommand>
{
    public RegisterCommandValidator()
    {
        RuleFor(x => x.Username)
            .NotEmpty()
            .MaximumLength(200);

        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress()
            .MaximumLength(200);

        RuleFor(x => x.Password)
            .NotEmpty()
            .MinimumLength(8);
    }
}

public sealed class RegisterCommand : ICommand<Domain.Entity.User>
{
    public required string Username { get; init; }
    public required string Email { get; init; }
    public required string Password { get; init; }
}

public sealed class RegisterCommandHandler(
    IPasswordHasher passwordHasher,
    IUnitOfWork unitOfWork,
    IUserRepository userRepository
) : ICommandHandler<RegisterCommand, Domain.Entity.User>
{
    public async ValueTask<Domain.Entity.User> Handle(RegisterCommand command, CancellationToken cancellationToken)
    {
        if (await userRepository.EmailExistAsync(command.Email))
        {
            throw new EmailAlreadyExistException($"Email '{command.Email}' already exist in the database");
        }

        if (await userRepository.UsernameExistAsync(command.Username))
        {
            throw new UsernameAlreadyExistException($"Username '{command.Username}' already exist in the database");
        }

        var user = new Domain.Entity.User
        {
            Email = command.Email,
            Password = passwordHasher.Hash(command.Password),
            Username = command.Username,
            LastLoginAt = DateTimeOffset.UtcNow,
        };

        userRepository.Add(user);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return user;
    }
}
