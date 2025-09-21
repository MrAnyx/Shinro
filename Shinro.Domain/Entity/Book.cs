using Shinro.Domain.Contract;
using System;
using System.ComponentModel.DataAnnotations;

namespace Shinro.Domain.Entity;

public class Book : Model.Entity, IHasTimestamps
{
    [MaxLength(50)]
    public required string Name { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
