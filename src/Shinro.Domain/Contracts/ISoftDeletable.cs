using System;

namespace Shinro.Domain.Contracts;

public interface ISoftDeletable
{
    DateTimeOffset? DeletedAt { get; set; }
    bool IsDeleted { get; set; }
}
