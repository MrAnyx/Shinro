using Shinro.Application.Contracts;
using Shinro.Domain.Enums;
using System;

namespace Shinro.Infrastructure.Services;

internal sealed class Hasher : IHasher
{
    public string Hash(string password, eHashAlgorithm algorithm) => algorithm switch
    {
        eHashAlgorithm.BCrypt => BcryptHash(password),
        _ => throw new NotSupportedException($"Hashing algorithm of type '{algorithm}' is not supported")
    };

    public bool Verify(string password, string hash, eHashAlgorithm algorithm) => algorithm switch
    {
        eHashAlgorithm.BCrypt => BcryptVerify(password, hash),
        _ => throw new NotSupportedException($"Hashing algorithm of type '{algorithm}' is not supported")
    };

    #region BCrypt
    private string BcryptHash(string password) => BCrypt.Net.BCrypt.EnhancedHashPassword(password, BCrypt.Net.HashType.SHA512);
    private bool BcryptVerify(string password, string hash) => BCrypt.Net.BCrypt.EnhancedVerify(password, hash, BCrypt.Net.HashType.SHA512);
    #endregion
}
