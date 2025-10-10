using Mediator;
using Microsoft.AspNetCore.Mvc;
using Shinro.Application.UseCase.User;
using Shinro.Domain.Entity;
using Shinro.Presentation.Contract.Authentication;
using System.Threading;
using System.Threading.Tasks;

namespace Shinro.Presentation.Controller;

[ApiController]
[Route("[controller]")]
public class AuthenticationController(IMediator mediator) : ControllerBase
{
    [HttpPost("register")]
    public async Task<ActionResult<User>> Register(
        [FromBody] RegisterDTO request,
        CancellationToken cancellationToken
    )
    {
        var command = new RegisterCommand
        {
            Username = request.Username,
            Email = request.Email,
            Password = request.Password,
        };

        var user = await mediator.Send(command, cancellationToken);

        return Ok(user);
    }
}
