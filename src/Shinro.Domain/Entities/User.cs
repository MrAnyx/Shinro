using System;
using System.Collections.Generic;

namespace Shinro.Domain.Entities;

public class User : Entity
{
    #region Main Properties
    public required string Username { get; set; }
    public required string Email { get; set; }
    #endregion

    #region Security
    public required string PasswordHash { get; set; }
    #endregion

    #region Audit
    public DateTimeOffset? LastLoginAt { get; set; }
    #endregion

    #region Relationships
    public ICollection<RefreshToken> RefreshTokens { get; set; } = [];
    public ICollection<Book> Books { get; set; } = [];
    #endregion
}
