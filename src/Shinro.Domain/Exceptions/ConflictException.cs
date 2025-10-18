namespace Shinro.Domain.Exceptions;

public class ConflictException(string message, System.Exception? innerException = null) : System.Exception(message, innerException)
{
}
