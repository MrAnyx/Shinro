namespace Shinro.Domain.Exceptions;

public class NotFoundException(string message, System.Exception? innerException = null) : System.Exception(message, innerException)
{
}
