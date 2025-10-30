using System;

namespace Shinro.Domain.Exceptions;

public class ConflictException(string message, Exception? innerException = null) : Exception(message, innerException)
{
}
