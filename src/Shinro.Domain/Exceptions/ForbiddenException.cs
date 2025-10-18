namespace Shinro.Domain.Exceptions;

public class ForbiddenException(string message, System.Exception? innerException = null) : System.Exception(message, innerException)
{
}
