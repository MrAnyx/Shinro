using Microsoft.AspNetCore.Mvc;
using System.Net.Mime;
using System.Threading.Tasks;

namespace Shinro.Presentation.Controllers;

[ApiController]
[Route("books")]
[Consumes(MediaTypeNames.Application.Json)]
[Produces(MediaTypeNames.Application.Json, MediaTypeNames.Application.ProblemJson)]
public class BookController() : ControllerBase
{
    #region Create a new book
    public sealed record CreateBookRequest(string Username, string Email, string Password);
    public sealed record RegisterResponse(string AccessToken, string RefreshToken);

    [HttpPost]
    //[ProducesResponseType(typeof(RegisterResponse), StatusCodes.Status200OK)]
    //[ProducesResponseType(StatusCodes.Status400BadRequest)]
    //[ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CreateBooks([FromBody] CreateBookRequest request)
    {
        await Task.CompletedTask;
        return Ok();
    }
    #endregion
}
