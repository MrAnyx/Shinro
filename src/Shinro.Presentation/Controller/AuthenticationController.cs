using Mediator;
using Microsoft.AspNetCore.Mvc;
using Shinro.Application.UseCase.User;
using Shinro.Presentation.Contract.Authentication;
using System.Threading;
using System.Threading.Tasks;

namespace Shinro.Presentation.Controller;

[ApiController]
[Route("[controller]")]
public class AuthenticationController(IMediator mediator) : ControllerBase
{
    [HttpPost("register")]
    public async Task<ActionResult<AccessTokenDTO>> Register([FromBody] RegisterDTO request, CancellationToken cancellationToken)
    {
        var command = new RegisterCommand
        {
            Username = request.Username,
            Email = request.Email,
            Password = request.Password,
        };
        var result = await mediator.Send(command, cancellationToken);

        if (result.IsSuccess)
        {
            return Ok(new AccessTokenDTO()
            {
                AccessToken = "",
                RefreshToken = ""
            });
        }
        else
        {
            return BadRequest();
        }

    }
}
