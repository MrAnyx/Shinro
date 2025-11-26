using Mapster;
using Mediator;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Shinro.Application.UseCases.Authentication;
using Shinro.Presentation.Models.Authentication;
using System.Net.Mime;
using System.Threading;
using System.Threading.Tasks;

namespace Shinro.Presentation.Controllers;

[ApiController]
[Route("auth")]
[Consumes(MediaTypeNames.Application.Json)]
[Produces(MediaTypeNames.Application.Json, MediaTypeNames.Application.ProblemJson)]
public class AuthenticationController(IMediator mediator) : ControllerBase
{
    #region Register
    public sealed record RegisterRequest(string Username, string Email, string Password);

    [HttpPost("register")]
    [ProducesResponseType(typeof(JwtTokenPairResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request, CancellationToken cancellationToken)
    {
        var command = request.Adapt<RegisterNewUserCommand>();

        var tokenPair = await mediator.Send(command, cancellationToken);

        return Ok(tokenPair.Adapt<JwtTokenPairResponse>());

        //TODO Update the location action
        //return CreatedAtAction(string.Empty, tokenPair.Adapt<RegisterResponse>());
    }
    #endregion

    #region Login
    public sealed record LoginRequest(string Identifier, string Password);

    [HttpPost("login")]
    [ProducesResponseType(typeof(JwtTokenPairResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        var command = request.Adapt<LoginUserCommand>();

        var tokenPair = await mediator.Send(command, cancellationToken);

        return Ok(tokenPair.Adapt<JwtTokenPairResponse>());
    }
    #endregion

    #region Refresh token
    public sealed record RefreshTokenRequest(string AccessToken, string RefreshToken);

    [HttpPost("refresh")]
    [ProducesResponseType(typeof(JwtTokenPairResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequest request, CancellationToken cancellationToken)
    {
        var command = request.Adapt<RefreshTokenCommand>();

        var tokenPair = await mediator.Send(command, cancellationToken);

        return Ok(tokenPair.Adapt<JwtTokenPairResponse>());
    }
    #endregion
}
