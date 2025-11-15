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
    public sealed record CreateBookResponse(Guid Id, string Title, string? Description, DateTimeOffset? ReleasedAt, double? Rating, string? Isbn, string? Author, uint? PageCount);

    [HttpPost]
    [ProducesResponseType(typeof(CreateBookResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateBooks([FromBody] CreateBookRequest request, CancellationToken cancellationToken)
    {
        var command = request.Adapt<CreateBookCommand>();

        var newBook = await mediator.Send(command, cancellationToken);

        return Ok(newBook.Adapt<CreateBookResponse>());
    }
    #endregion

    #region Get one book
    public sealed record GetOneBookResponse(Guid Id, string Title, string? Description, DateTimeOffset? ReleasedAt, double? Rating, string? Isbn, string? Author, uint? PageCount);

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(GetOneBookResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetOneBook(Guid id, CancellationToken cancellationToken)
    {
        var query = new GetOneGookQuery(id);

        var book = await mediator.Send(query, cancellationToken);

        return Ok(book.Adapt<GetOneBookResponse>());
    }
    #endregion
}
