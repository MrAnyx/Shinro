using Mapster;
using Shinro.Application.UseCases.Books;
using Shinro.Domain.Entities;
using Shinro.Presentation.Controllers;

namespace Shinro.Presentation.Mapping;

internal sealed class BookMappingConfiguration : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        #region Create book
        config.NewConfig<BookController.CreateBookRequest, CreateBookCommand>().TwoWays();
        config.NewConfig<Book, BookController.CreateBookResponse>().TwoWays();
        #endregion
    }
}
