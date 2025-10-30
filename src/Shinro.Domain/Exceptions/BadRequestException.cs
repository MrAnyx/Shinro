using System;

namespace Shinro.Domain.Exceptions;

public class BadRequestException(string message, Exception? innerException = null) : Exception(message, innerException)
{
}
