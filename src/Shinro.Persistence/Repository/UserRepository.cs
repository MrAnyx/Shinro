using Microsoft.EntityFrameworkCore;
using Shinro.Application.Contract.Persistence.Repository;
using Shinro.Domain.Entity;
using Shinro.Persistence.Service;
using System.Threading.Tasks;

namespace Shinro.Persistence.Repository;

internal sealed class UserRepository(ApplicationDbContext context) : Repository<User>(context), IUserRepository
{
    public async Task<bool> EmailExistAsync(string email) => await _context.Users.AnyAsync(u => u.Email == email);
    public async Task<bool> UsernameExistAsync(string username) => await _context.Users.AnyAsync(u => u.Username == username);
}
