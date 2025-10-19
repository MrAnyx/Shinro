namespace Shinro.Domain.Exceptions.Global;
public class InvalidFormatException(string message, System.Exception? innerException = null) : ConflictException(message, innerException)
{
}
