namespace Shinro.Domain.Exceptions.Authentication;
public class InvalidCredentialsException(string message, System.Exception? innerException = null) : BadRequestException(message, innerException)
{
}

