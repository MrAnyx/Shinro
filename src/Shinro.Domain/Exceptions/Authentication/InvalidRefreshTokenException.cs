namespace Shinro.Domain.Exceptions.Authentication;
public class InvalidRefreshTokenException(string message, System.Exception? innerException = null) : BadRequestException(message, innerException)
{
}
