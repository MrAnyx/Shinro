using Shinro.Domain.Entity;
using System.Threading.Tasks;

namespace Shinro.Application.Contract.Persistence.Repository;

public interface IUserRepository : IRepository<User>
{
    Task<bool> EmailExistAsync(string email);
    Task<bool> UsernameExistAsync(string username);
}
