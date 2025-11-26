using Mapster;
using Shinro.Domain.Entities;
using Shinro.Presentation.Models.Books;

namespace Shinro.Presentation.Mapping;

internal sealed class BookMappingConfiguration : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<Book, BookResponse>();
    }
}
