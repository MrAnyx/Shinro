using FluentValidation;
using Mediator;
using Shinro.Application.Contracts;
using Shinro.Application.Contracts.Persistence;
using Shinro.Application.Contracts.Persistence.Repository;
using Shinro.Domain.Entities;
using Shinro.Domain.Enums;
using Shinro.Domain.Models;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Shinro.Application.UseCases.Authentication;

public sealed class RefreshTokenCommandValidator : AbstractValidator<RefreshTokenCommand>
{
    public RefreshTokenCommandValidator()
    {
        RuleFor(x => x.AccessToken)
            .NotEmpty();

        RuleFor(x => x.RefreshToken)
            .NotEmpty();
    }
}

public sealed record RefreshTokenCommand(
    string AccessToken,
    string RefreshToken
) : ICommand<JwtTokenPair>;

internal sealed class RefreshTokenCommandHandler(
    IJwtTokenProvider jwtTokenProvider,
    IRefreshTokenRepository refreshTokenRepository,
    IUserRepository userRepository,
    IHasher hasher,
    IUnitOfWork unitOfWork
) : ICommandHandler<RefreshTokenCommand, JwtTokenPair>
{
    public async ValueTask<JwtTokenPair> Handle(RefreshTokenCommand command, CancellationToken cancellationToken)
    {
        if (!jwtTokenProvider.TryGetClaim(command.AccessToken, JwtClaimName.Rtid, out var refreshTokenId))
        {
            throw new ArgumentException("Invalid token");
        }

        if (!Guid.TryParse(refreshTokenId, out var refreshTokenGuid))
        {
            throw new ArgumentException("Invalid refresh token id");
        }

        var refreshToken = await refreshTokenRepository.GetByIdAsync(refreshTokenGuid, cancellationToken)
            ?? throw new ArgumentException("Refresh token not found");

        if (refreshToken.ExpiresAt < DateTimeOffset.UtcNow || refreshToken.RevokedAt < DateTimeOffset.UtcNow)
        {
            throw new ArgumentException("This refresh token is expired or revoked");
        }

        if (!hasher.Verify(command.RefreshToken, refreshToken.TokenHash, eHashAlgorithm.BCrypt))
        {
            throw new ArgumentException("Invalid refresh token value");
        }

        if (!jwtTokenProvider.TryGetClaim(command.AccessToken, JwtClaimName.Sub, out var userId))
        {
            throw new ArgumentException("Invalid token");
        }

        if (!Guid.TryParse(userId, out var userGuid))
        {
            throw new ArgumentException("Invalid user id");
        }

        var user = await userRepository.GetByIdAsync(userGuid, cancellationToken)
            ?? throw new ArgumentException("User not found");

        refreshToken.RevokedAt = DateTimeOffset.UtcNow;
        refreshTokenRepository.Update(refreshToken);

        var rawRefreshToken = jwtTokenProvider.GenerateRefreshToken();
        var newRefreshToken = new RefreshToken()
        {
            TokenHash = hasher.Hash(rawRefreshToken, eHashAlgorithm.BCrypt),
            UserId = user.Id,
            ExpiresAt = DateTimeOffset.UtcNow.AddDays(14)
        };

        refreshTokenRepository.Add(newRefreshToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var accessToken = jwtTokenProvider.GenerateAccessToken(user, newRefreshToken);

        return new JwtTokenPair(accessToken, rawRefreshToken);
    }
}
