using System;

namespace Shinro.Domain.Contracts;

public interface IHasTimestamps
{
    DateTimeOffset CreatedAt { get; set; }
    DateTimeOffset UpdatedAt { get; set; }
}
