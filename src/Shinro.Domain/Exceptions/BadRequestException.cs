namespace Shinro.Domain.Exceptions;

public class BadRequestException(string message, System.Exception? innerException = null) : System.Exception(message, innerException)
{
}
