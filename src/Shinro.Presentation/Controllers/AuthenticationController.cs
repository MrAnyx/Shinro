using Mapster;
using Mediator;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Shinro.Application.UseCases.Authentication;
using System.Net.Mime;
using System.Threading;
using System.Threading.Tasks;

namespace Shinro.Presentation.Controllers;

[ApiController]
[Route("[controller]")]
[Consumes(MediaTypeNames.Application.Json)]
[Produces(MediaTypeNames.Application.Json, MediaTypeNames.Application.ProblemJson)]
public class AuthenticationController(IMediator mediator) : ControllerBase
{
    #region Register
    public sealed record RegisterRequest(string Username, string Email, string Password);
    public sealed record RegisterResponse(string AccessToken, string RefreshToken);

    [HttpPost("register")]
    [ProducesResponseType(typeof(RegisterResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request, CancellationToken cancellationToken)
    {
        var tokenPair = await mediator.Send(
            new RegisterNewUserCommand(request.Username, request.Email, request.Password),
            cancellationToken
        );

        return Ok(tokenPair.Adapt<RegisterResponse>());
    }
    #endregion
}
