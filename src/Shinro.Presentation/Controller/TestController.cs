using Microsoft.AspNetCore.Mvc;
using System;

namespace Shinro.Presentation.Controller;

[ApiController]
[Route("[controller]")]
public sealed class TestBookGamesController : ControllerBase
{
    [HttpGet("toto-pascal")]
    public ActionResult<int> GetTest()
    {
        return DateTime.DaysInMonth(2024, 12);
    }
}
