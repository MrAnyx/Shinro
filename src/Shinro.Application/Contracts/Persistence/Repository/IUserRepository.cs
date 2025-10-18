using Shinro.Application.Contracts.Persistence;
using Shinro.Domain.Entities;
using System.Threading.Tasks;

namespace Shinro.Application.Contracts.Persistence.Repository;

public interface IUserRepository : IRepository<User>
{
    Task<bool> EmailExistAsync(string email);
    Task<bool> UsernameExistAsync(string username);
}
