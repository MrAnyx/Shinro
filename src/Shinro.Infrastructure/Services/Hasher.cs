using Microsoft.Extensions.Configuration;
using Shinro.Application.Contracts;
using Shinro.Domain.Enums;
using System;
using System.Security.Cryptography;
using System.Text;

namespace Shinro.Infrastructure.Services;

internal sealed class Hasher(IConfiguration configuration) : IHasher
{
    public string Hash(string password, eHashAlgorithm algorithm) => algorithm switch
    {
        eHashAlgorithm.BCrypt => BcryptHash(password),
        eHashAlgorithm.HMAC512 => Hmac512Hash(password),
        _ => throw new NotSupportedException($"Hashing algorithm of type '{algorithm}' is not supported")
    };

    public bool Verify(string password, string hash, eHashAlgorithm algorithm) => algorithm switch
    {
        eHashAlgorithm.BCrypt => BcryptVerify(password, hash),
        eHashAlgorithm.HMAC512 => Hmac512Verify(password, hash),
        _ => throw new NotSupportedException($"Hashing algorithm of type '{algorithm}' is not supported")
    };

    #region BCrypt
    private string BcryptHash(string password) => BCrypt.Net.BCrypt.EnhancedHashPassword(password, BCrypt.Net.HashType.SHA512);
    private bool BcryptVerify(string password, string hash) => BCrypt.Net.BCrypt.EnhancedVerify(password, hash, BCrypt.Net.HashType.SHA512);
    #endregion

    #region Hmac256
    private string Hmac512Hash(string password)
    {
        using var hmac = new HMACSHA3_512(Encoding.UTF8.GetBytes(configuration.GetValue<string>("App:Secret")!));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(hash);
    }
    private bool Hmac512Verify(string password, string hash)
    {
        var computedHash = Hmac512Hash(password);
        return CryptographicOperations.FixedTimeEquals(
            Convert.FromBase64String(computedHash),
            Convert.FromBase64String(hash)
        );
    }
    #endregion
}
