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
[Route("auth")]
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
        var command = request.Adapt<RegisterNewUserCommand>();

        var tokenPair = await mediator.Send(command, cancellationToken);

        return Ok(tokenPair.Adapt<RegisterResponse>());
    }
    #endregion

    #region Login
    public sealed record LoginRequest(string Identifier, string Password);
    public sealed record LoginResponse(string AccessToken, string RefreshToken);

    [HttpPost("login")]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        var command = request.Adapt<LoginUserCommand>();

        var tokenPair = await mediator.Send(command, cancellationToken);

        return Ok(tokenPair.Adapt<LoginResponse>());
    }
    #endregion

    #region Refresh token
    public sealed record RefreshTokenRequest(string AccessToken, string RefreshToken);
    public sealed record RefreshTokenResponse(string AccessToken, string RefreshToken);

    [HttpPost("refresh")]
    [ProducesResponseType(typeof(RefreshTokenResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Login([FromBody] RefreshTokenRequest request, CancellationToken cancellationToken)
    {
        var command = request.Adapt<RefreshTokenCommand>();

        var tokenPair = await mediator.Send(command, cancellationToken);

        return Ok(tokenPair.Adapt<RefreshTokenResponse>());
    }
    #endregion
}
