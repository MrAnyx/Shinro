namespace Shinro.Domain.Exception;

public class BadRequestException(string message, System.Exception? innerException = null) : System.Exception(message, innerException)
{
}
