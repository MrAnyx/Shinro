using Mapster;
using Mediator;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Shinro.Application.Models;
using Shinro.Application.UseCases.Books;
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
    #region Create a new book
    [HttpPost]
    [ProducesResponseType(typeof(BookResponse), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateBooks([FromBody] CreateBookCommand command, CancellationToken cancellationToken)
    {
        var newBook = await mediator.Send(command, cancellationToken);

        return CreatedAtAction(nameof(GetOneBook), new { id = newBook.Id }, newBook.Adapt<BookResponse>());
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

    #region Delete one book
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(BookResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> DeleteOneBook(Guid id, CancellationToken cancellationToken)
    {
        var command = new DeleteOneBookCommand(id);

        var book = await mediator.Send(command, cancellationToken);

        return Ok(book.Adapt<BookResponse>());
    }
    #endregion

    #region Get all books
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedList<BookResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllBooks([FromQuery] GetAllBooksQuery query, CancellationToken cancellationToken)
    {
        var (books, totalCount) = await mediator.Send(query, cancellationToken);

        return Ok(new PaginatedList<BookResponse>(books.Adapt<IEnumerable<BookResponse>>(), query.PageNumber, query.PageSize, totalCount));
    }
    #endregion

    #region Update one book
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(BookResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateOneBook(Guid id, [FromBody] UpdateOneBookCommand command, CancellationToken cancellationToken)
    {
        var updatedBook = await mediator.Send(command, cancellationToken);

        return Ok(updatedBook.Adapt<BookResponse>());
    }
    #endregion
}
