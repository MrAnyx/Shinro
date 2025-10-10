namespace Shinro.Domain.Exception.User;

public class EmailAlreadyExistException(string message, System.Exception? innerException = null) : ConflictException(message, innerException)
{
}
