using Shinro.Application.Contracts.Configuration;
using System.ComponentModel.DataAnnotations;

namespace Shinro.Infrastructure.Models;

public class JwtOptions : IJwtOptions
{
    [Required]
    [MinLength(200)]
    public required string Secret { get; init; }

    [Required]
    public required string Issuer { get; init; }

    [Required]
    public required string Audience { get; init; }

    [Required]
    [Range(1, 5)]
    public required uint AccessTokenExpirationInMinutes { get; init; }
}
