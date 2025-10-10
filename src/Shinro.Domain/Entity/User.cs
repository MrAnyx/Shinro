using Shinro.Domain.Contract;
using System;

namespace Shinro.Domain.Entity;

public class User : Model.Entity, IHasTimestamps
{
    #region Main Properties
    public required string Username { get; set; }
    public required string Email { get; set; }
    #endregion

    #region Security
    public required string Password { get; set; }
    #endregion

    #region Timestamps
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    #endregion

    #region Audit
    public DateTimeOffset? LastLoginAt { get; set; }
    #endregion

    #region Status
    public bool IsActive { get; set; } = true;
    #endregion
}
