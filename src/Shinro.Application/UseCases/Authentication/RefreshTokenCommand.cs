using FluentValidation;
using Mediator;
using Shinro.Application.Contracts;
using Shinro.Application.Contracts.Persistence;
using Shinro.Application.Contracts.Persistence.Repository;
using Shinro.Domain.Entities;
using Shinro.Domain.Enums;
using Shinro.Domain.Exceptions.Authentication;
using Shinro.Domain.Exceptions.Entity;
using Shinro.Domain.Exceptions.Global;
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
            throw new InvalidAccessTokenException($"Invalid access token, missing '{JwtClaimName.Rtid}' claim");
        }

        if (!Guid.TryParse(refreshTokenId, out var refreshTokenGuid))
        {
            throw new InvalidFormatException("The refresh token ID in the access token has an invalid format");
        }

        var refreshToken = await refreshTokenRepository.GetByIdAsync(refreshTokenGuid, cancellationToken)
            ?? throw new EntityNotFoundException("Refresh token not found");

        if (refreshToken.ExpiresAt <= DateTimeOffset.UtcNow)
        {
            throw new InvalidRefreshTokenException("The refresh token has expired");
        }

        if (refreshToken.RevokedAt <= DateTimeOffset.UtcNow)
        {
            throw new InvalidRefreshTokenException("The refresh token has already been revoked");
        }

        if (!hasher.Verify(command.RefreshToken, refreshToken.TokenHash, eHashAlgorithm.BCrypt))
        {
            throw new InvalidRefreshTokenException("The provided refresh token does not match the stored token");
        }

        if (!jwtTokenProvider.TryGetClaim(command.AccessToken, JwtClaimName.Sub, out var userId))
        {
            throw new InvalidAccessTokenException($"Invalid access token, missing '{JwtClaimName.Sub}' claim");
        }

        if (!Guid.TryParse(userId, out var userGuid))
        {
            throw new InvalidFormatException("User ID from access token has an invalid format");
        }

        var user = await userRepository.GetByIdAsync(userGuid, cancellationToken)
            ?? throw new EntityNotFoundException("User not found");

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
