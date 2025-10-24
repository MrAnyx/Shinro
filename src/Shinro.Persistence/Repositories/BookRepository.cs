using Shinro.Application.Contracts.Persistence.Repository;
using Shinro.Domain.Entities;
using Shinro.Persistence.Services;

namespace Shinro.Persistence.Repositories;

internal sealed class BookRepository(ApplicationDbContext context) : Repository<Book>(context), IBookRepository
{
}
