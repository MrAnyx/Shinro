namespace Shinro.Domain.Exception.Entity;

public class EntityNotFoundException(string message, System.Exception? innerException = null) : NotFoundException(message, innerException)
{
}
