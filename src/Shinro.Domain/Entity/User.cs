using System;

namespace Shinro.Domain.Entity;

public class User : Entity
{
    #region Main Properties
    public required string Username { get; set; }
    public required string Email { get; set; }
    #endregion

    #region Security
    public required string Password { get; set; }
    #endregion

    #region Audit
    public DateTimeOffset? LastLoginAt { get; set; }
    #endregion
}
