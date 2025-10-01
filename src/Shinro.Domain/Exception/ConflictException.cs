namespace Shinro.Domain.Exception;

public class ConflictException(string message, System.Exception? innerException = null) : System.Exception(message, innerException)
{
}
