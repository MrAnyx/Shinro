using Shinro.Application.Contracts.Persistence.Repository;
using Shinro.Domain.Entities;
using Shinro.Persistence.Services;

namespace Shinro.Persistence.Repositories;

internal sealed class MediaItemRepository(ApplicationDbContext context) : Repository<MediaItem>(context), IMediaItemRepository
{
}
