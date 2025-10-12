using Shinro.Application.Contract.Persistence.Repository;
using Shinro.Domain.Entity;
using Shinro.Persistence.Service;

namespace Shinro.Persistence.Repository;

internal sealed class RefreshTokenRepository(ApplicationDbContext context) : Repository<RefreshToken>(context), IRefreshTokenRepository
{
}
