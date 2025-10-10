namespace Shinro.Domain.Exception.User;

public class UsernameAlreadyExistException(string message, System.Exception? innerException = null) : ConflictException(message, innerException)
{
}
