namespace Shinro.Application.Contracts;

public interface IHasher
{
    string Hash(string password);
    bool Verify(string password, string hash);
}
