using System;

namespace Shinro.Application.Contracts;

public interface IUserContext
{
    Guid? UserId { get; }
    string? Email { get; }
    string? UserName { get; }
    bool IsAuthenticated { get; }
}