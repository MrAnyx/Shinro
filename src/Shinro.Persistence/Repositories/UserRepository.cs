using Microsoft.EntityFrameworkCore;
using Shinro.Application.Contracts.Persistence.Repository;
using Shinro.Domain.Entities;
using Shinro.Persistence.Services;
using System.Threading.Tasks;

namespace Shinro.Persistence.Repositories;

internal sealed class UserRepository(ApplicationDbContext context) : Repository<User>(context), IUserRepository
{
    public async Task<bool> EmailExistAsync(string email) => await _context.Users.AnyAsync(u => u.Email == email);
    public async Task<bool> UsernameExistAsync(string username) => await _context.Users.AnyAsync(u => u.Username == username);
    public async Task<User?> GetByIdentifierAsync(string identifier) => await _context.Users.FirstOrDefaultAsync(u => u.Username == identifier || u.Email == identifier);
}
