using Mediator;
using Shinro.Application.Model;
using System.Threading;
using System.Threading.Tasks;

namespace Shinro.Application.UseCase.User;

public sealed class RegisterCommand : ICommand<Result<Domain.Entity.User>>
{
    public required string Username { get; init; }
    public required string Email { get; init; }
    public required string Password { get; init; }
}

public sealed class RegisterCommandHandler : ICommandHandler<RegisterCommand, Result<Domain.Entity.User>>
{
    public async ValueTask<Result<Domain.Entity.User>> Handle(RegisterCommand command, CancellationToken cancellationToken)
    {
        await Task.CompletedTask;
        return Error.Validation("code", "description");
    }
}
