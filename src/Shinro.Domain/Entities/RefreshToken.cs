using System;

namespace Shinro.Domain.Entities;

public class RefreshToken : Entity
{
    #region Main properties
    public required string TokenHash { get; set; }
    #endregion

    #region Security dates
    public required DateTimeOffset ExpiresAt { get; set; }
    public DateTimeOffset? RevokedAt { get; set; }
    #endregion

    #region Relationships
    public required Guid UserId { get; set; }
    public User? User { get; set; }
    #endregion
}
