using Mapster;
using Mediator;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Shinro.Application.Models;
using Shinro.Application.UseCases.Books;
using Shinro.Presentation.Models;
using Shinro.Presentation.Models.Books;
using System;
using System.Collections.Generic;
using System.Net.Mime;
using System.Threading;
using System.Threading.Tasks;

namespace Shinro.Presentation.Controllers;

[Authorize]
[ApiController]
[Route("books")]
[Consumes(MediaTypeNames.Application.Json)]
[Produces(MediaTypeNames.Application.Json, MediaTypeNames.Application.ProblemJson)]
public class BookController(IMediator mediator) : ControllerBase
{
    #region Get all books
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedList<BookResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllBooks([FromQuery] PaginationRequest request, CancellationToken cancellationToken)
    {
        var query = request.Adapt<GetAllBooksQuery>();

        var (books, totalCount) = await mediator.Send(query, cancellationToken);

        return Ok(new PaginatedList<BookResponse>(books.Adapt<IEnumerable<BookResponse>>(), query.PageNumber, query.PageSize, totalCount));
    }
    #endregion

    #region Get one book
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(BookResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetOneBook(Guid id, CancellationToken cancellationToken)
    {
        var query = new GetOneBookQuery(id);

        var book = await mediator.Send(query, cancellationToken);

        return Ok(book.Adapt<BookResponse>());
    }
    #endregion

    #region Create a new book
    public sealed record CreateOneBookRequest(string Title, string? Description, DateOnly? ReleasedAt, double? Rating, string? Isbn, string? Author, uint? PageCount);

    [HttpPost]
    [ProducesResponseType(typeof(BookResponse), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateOneBook([FromBody] CreateOneBookRequest request, CancellationToken cancellationToken)
    {
        var command = Request.Adapt<CreateBookCommand>();

        var newBook = await mediator.Send(command, cancellationToken);

        return CreatedAtAction(nameof(GetOneBook), new { id = newBook.Id }, newBook.Adapt<BookResponse>());
    }
    #endregion

    #region Update one book
    public sealed record UpdateOneBookRequest(string Title, string? Description, DateOnly? ReleasedAt, double? Rating, string? Isbn, string? Author, uint? PageCount);

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(BookResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateOneBook(Guid id, [FromBody] UpdateOneBookRequest request, CancellationToken cancellationToken)
    {
        var command = (id, request).Adapt<UpdateOneBookCommand>();

        var updatedBook = await mediator.Send(command, cancellationToken);

        return Ok(updatedBook.Adapt<BookResponse>());
    }
    #endregion

    #region Delete one book
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> DeleteOneBook(Guid id, CancellationToken cancellationToken)
    {
        var command = new DeleteOneBookCommand(id);

        await mediator.Send(command, cancellationToken);

        return NoContent();
    }
    #endregion

}
