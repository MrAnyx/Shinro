using Microsoft.AspNetCore.Http;
using Shinro.Application.Contracts;
using Shinro.Domain.Enums;
using System;
using System.Security.Claims;

namespace Shinro.Infrastructure.Models;

internal sealed class UserContext(IHttpContextAccessor httpContextAccessor) : IUserContext
{
    private readonly ClaimsPrincipal? _user = httpContextAccessor.HttpContext?.User;

    public bool IsAuthenticated => _user?.Identity?.IsAuthenticated ?? false;

    public Guid? UserId
    {
        get
        {
            var idClaim = _user?.FindFirstValue(JwtClaimName.UserId);

            return Guid.TryParse(idClaim, out var userId) ? userId : null;
        }
    }

    public string? Email => _user?.FindFirstValue(ClaimTypes.Email);
    public string? UserName => _user?.Identity?.Name;
}