using Microsoft.AspNetCore.Mvc;
using System;

namespace Shinro.Core.Controllers;

[ApiController]
[Route("[controller]")]
internal sealed class WeatherForecastController : ControllerBase
{
    public ActionResult<int> GetTest()
    {
        return DateTime.DaysInMonth(2024, 12);
    }
}
