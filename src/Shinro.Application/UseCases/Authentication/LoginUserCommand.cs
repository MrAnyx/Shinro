using FluentValidation;
using Mediator;
using Shinro.Domain.Models;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Shinro.Application.UseCases.Authentication;

public sealed class LoginCommandValidator : AbstractValidator<LoginUserCommand>
{
    public LoginCommandValidator()
    {
        RuleFor(x => x.Identifier)
            .NotEmpty()
            .MinimumLength(3)
            .MaximumLength(200);

        RuleFor(x => x.Password)
            .NotEmpty()
            .MinimumLength(8);
    }
}

public sealed record LoginUserCommand(
    string Identifier,
    string Password
) : ICommand<JwtTokenPair>;

internal sealed class LoginCommandHandler() : ICommandHandler<LoginUserCommand, JwtTokenPair>
{
    public ValueTask<JwtTokenPair> Handle(LoginUserCommand command, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
