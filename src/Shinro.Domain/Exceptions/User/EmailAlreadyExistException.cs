using Shinro.Domain.Exceptions;

namespace Shinro.Domain.Exceptions.User;

public class EmailAlreadyExistException(string message, System.Exception? innerException = null) : ConflictException(message, innerException)
{
}
