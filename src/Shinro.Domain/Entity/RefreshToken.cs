using System;

namespace Shinro.Domain.Entity;

public class RefreshToken : Entity
{
    public required string Token { get; set; }
    public required DateTimeOffset ExpiresAt { get; set; }

    public required Guid UserId { get; set; }
    public User? User { get; set; }
}
