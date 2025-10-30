using System;

namespace Shinro.Domain.Exceptions;

public class ForbiddenException(string message, Exception? innerException = null) : Exception(message, innerException)
{
}
