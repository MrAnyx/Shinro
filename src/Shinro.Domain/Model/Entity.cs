using System;

namespace Shinro.Domain.Model;

public abstract class Entity
{
    public Guid Id { get; set; } = Ulid.Empty.ToGuid();
}
