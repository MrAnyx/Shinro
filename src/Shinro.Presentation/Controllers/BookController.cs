using Mapster;
using Mediator;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Shinro.Application.UseCases.Books;
using System;
using System.Net.Mime;
using System.Threading;
using System.Threading.Tasks;

namespace Shinro.Presentation.Controllers;

[Authorize]
[ApiController]
[Route("books")]
[Consumes(MediaTypeNames.Application.Json)]
[Produces(MediaTypeNames.Application.Json, MediaTypeNames.Application.ProblemJson)]
public class BookController(
    IMediator mediator
) : ControllerBase
{
    #region Create a new book
    public sealed record CreateBookRequest(string Title, string? Description, DateTimeOffset? ReleasedAt, double? Rating, string? Isbn, string? Author, uint? PageCount);
    public sealed record CreateBookResponse(string Title, string? Description, DateTimeOffset? ReleasedAt, double? Rating, string? Isbn, string? Author, uint? PageCount);

    [HttpPost]
    [ProducesResponseType(typeof(CreateBookResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateBooks([FromBody] CreateBookRequest request, CancellationToken cancellationToken)
    {
        var command = request.Adapt<CreateBookCommand>();

        var tokenPair = await mediator.Send(command, cancellationToken);

        return Ok(tokenPair.Adapt<CreateBookResponse>());
    }
    #endregion
}
