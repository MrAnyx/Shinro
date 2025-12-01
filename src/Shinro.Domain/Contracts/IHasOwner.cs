using Shinro.Domain.Entities;
using System;

namespace Shinro.Domain.Contracts;

public interface IHasOwner
{
    Guid UserId { get; set; }
    User? User { get; set; }
}
