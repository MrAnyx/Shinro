using Shinro.Application.Contract;

namespace Shinro.Infrastructure.Service;

internal sealed class PasswordHasher : IPasswordHasher
{
    public string Hash(string password) => BCrypt.Net.BCrypt.EnhancedHashPassword(password, BCrypt.Net.HashType.SHA512);
    public bool Verify(string password, string hash) => BCrypt.Net.BCrypt.EnhancedVerify(password, hash, BCrypt.Net.HashType.SHA512);
}
