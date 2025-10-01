namespace Shinro.Domain.Exception;

public class ForbiddenException(string message, System.Exception? innerException = null) : System.Exception(message, innerException)
{
}
