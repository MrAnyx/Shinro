using Mediator;
using Microsoft.AspNetCore.Mvc;
using Shinro.Application.UseCase;
using System;
using System.Threading.Tasks;

namespace Shinro.Presentation.Controller;

[ApiController]
[Route("[controller]")]
public sealed class TestBookGamesController(
    IMediator mediator
) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<int>> GetTest()
    {
        var tmp = await mediator.Send(new Ping(Guid.NewGuid()));
        return DateTime.DaysInMonth(2024, 12);
    }
}
