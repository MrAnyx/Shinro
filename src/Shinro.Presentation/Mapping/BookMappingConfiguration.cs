using Mapster;
using Shinro.Application.UseCases.Books;
using Shinro.Domain.Entities;
using Shinro.Presentation.Controllers;
using Shinro.Presentation.Models;
using Shinro.Presentation.Models.Books;
using System;

namespace Shinro.Presentation.Mapping;

internal sealed class BookMappingConfiguration : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<Book, BookResponse>()
            .ConstructUsing(src => new BookResponse(src.Id, src.Title, src.Description, src.ReleasedAt, src.Rating, src.Isbn, src.Author, src.PageCount, src.CreatedAt, src.UpdatedAt));

        config.NewConfig<PaginationRequest, GetAllBooksQuery>()
            .ConstructUsing(src => new GetAllBooksQuery(src.PageNumber, src.PageSize, src.SortOrder));

        config.NewConfig<BookController.CreateOneBookRequest, CreateBookCommand>()
            .ConstructUsing(src => new CreateBookCommand(src.Title, src.Description, src.ReleasedAt, src.Rating, src.Isbn, src.Author, src.PageCount));

        config.NewConfig<(Guid Id, BookController.UpdateOneBookRequest Request), UpdateOneBookCommand>()
            .ConstructUsing(src => new UpdateOneBookCommand(src.Id, src.Request.Title, src.Request.Description, src.Request.ReleasedAt, src.Request.Rating, src.Request.Isbn, src.Request.Author, src.Request.PageCount));
    }
}
