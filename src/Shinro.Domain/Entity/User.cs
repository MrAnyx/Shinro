using Shinro.Domain.Contract;
using System;
using System.ComponentModel.DataAnnotations;

namespace Shinro.Domain.Entity;

public class User : Model.Entity, IHasTimestamps
{
    #region Main Properties
    [Required, StringLength(200)]
    public required string Username { get; set; }

    [Required, StringLength(200), EmailAddress]
    public required string Email { get; set; }

    [Required]
    public required string Password { get; set; }
    #endregion

    #region Timestamps
    [Required]
    public DateTimeOffset CreatedAt { get; set; }

    [Required]
    public DateTimeOffset UpdatedAt { get; set; }
    #endregion

    #region Audit
    public DateTimeOffset? LastLoginAt { get; set; }
    #endregion

    #region Status
    [Required]
    public bool IsActive { get; set; } = true;
    #endregion
}
