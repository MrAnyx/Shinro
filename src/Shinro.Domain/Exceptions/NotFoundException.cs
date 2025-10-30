using System;

namespace Shinro.Domain.Exceptions;

public class NotFoundException(string message, Exception? innerException = null) : Exception(message, innerException)
{
}
