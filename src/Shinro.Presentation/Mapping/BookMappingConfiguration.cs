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
            .Map(dest => dest, src => src);

        config.NewConfig<PaginationRequest, GetAllBooksQuery>()
            .Map(dest => dest, src => src);

        config.NewConfig<BookController.CreateOneBookRequest, CreateBookCommand>()
            .Map(dest => dest, src => src);

        config.NewConfig<(Guid Id, BookController.UpdateOneBookRequest Request), UpdateOneBookCommand>()
            .Map(dest => dest.Id, src => src.Id)
            .Map(dest => dest, src => src.Request);
    }
}
