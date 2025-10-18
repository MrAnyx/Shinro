using Shinro.Domain.Exceptions;

namespace Shinro.Domain.Exceptions.User;

public class UsernameAlreadyExistException(string message, System.Exception? innerException = null) : ConflictException(message, innerException)
{
}
