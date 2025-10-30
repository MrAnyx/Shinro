using System;

namespace Shinro.Domain.Exceptions;

public class UnauthorizedException(string message, Exception? innerException = null) : Exception(message, innerException)
{
}
