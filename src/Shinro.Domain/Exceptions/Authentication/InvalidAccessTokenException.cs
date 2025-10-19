namespace Shinro.Domain.Exceptions.Authentication;
public class InvalidAccessTokenException(string message, System.Exception? innerException = null) : BadRequestException(message, innerException)
{
}

