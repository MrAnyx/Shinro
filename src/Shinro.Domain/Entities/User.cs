using System;

namespace Shinro.Domain.Entities;

public class User : Entity
{
    #region Main Properties
    public required string Username { get; set; }
    public required string Email { get; set; }
    #endregion

    #region Security
    public required string Password { get; set; }
    public RefreshToken? RefreshToken { get; set; }
    #endregion

    #region Audit
    public DateTimeOffset? LastLoginAt { get; set; }
    #endregion
}
