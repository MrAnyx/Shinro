using Shinro.Application.Contracts;

namespace Shinro.Infrastructure.Services;

internal sealed class Hasher : IHasher
{
    public string Hash(string password) => BCrypt.Net.BCrypt.EnhancedHashPassword(password, BCrypt.Net.HashType.SHA512);
    public bool Verify(string password, string hash) => BCrypt.Net.BCrypt.EnhancedVerify(password, hash, BCrypt.Net.HashType.SHA512);
}
