using Mediator;
using Microsoft.AspNetCore.Mvc;
using Shinro.Application.Contract;
using Shinro.Application.UseCase.User;
using Shinro.Domain.Model;
using Shinro.Presentation.Contract.Authentication;
using System.Threading;
using System.Threading.Tasks;

namespace Shinro.Presentation.Controller;

[ApiController]
[Route("[controller]")]
public class AuthenticationController(
    IMediator mediator,
    IJwtTokenProvider jwtTokenService
) : ControllerBase
{
    [HttpPost("register")]
    public async Task<ActionResult<JwtTokenPair>> Register(
        [FromBody] CreateUserForm request,
        CancellationToken cancellationToken
    )
    {
        var user = await mediator.Send(
            new CreateUserCommand(request.Username, request.Email, request.Password),
            cancellationToken
        );

        var accessToken = jwtTokenService.GenerateAccessToken(user);
        var refreshToken = jwtTokenService.GenerateRefreshToken(user);

        return Ok(new JwtTokenPair(accessToken, refreshToken));
    }
}
