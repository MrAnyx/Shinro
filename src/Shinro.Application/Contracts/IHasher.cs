using Shinro.Domain.Enums;

namespace Shinro.Application.Contracts;

public interface IHasher
{
    string Hash(string password, eHashAlgorithm algorithm);
    bool Verify(string password, string hash, eHashAlgorithm algorithm);
}
