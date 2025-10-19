using FluentValidation;
using Mediator;
using Shinro.Application.Contracts;
using Shinro.Application.Contracts.Persistence;
using Shinro.Application.Contracts.Persistence.Repository;
using Shinro.Domain.Entities;
using Shinro.Domain.Enums;
using Shinro.Domain.Exceptions.Authentication;
using Shinro.Domain.Models;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Shinro.Application.UseCases.Authentication;

public sealed class LoginCommandValidator : AbstractValidator<LoginUserCommand>
{
    public LoginCommandValidator()
    {
        RuleFor(x => x.Identifier)
            .NotEmpty()
            .MinimumLength(3)
            .MaximumLength(200);

        RuleFor(x => x.Password)
            .NotEmpty()
            .MinimumLength(8);
    }
}

public sealed record LoginUserCommand(
    string Identifier,
    string Password
) : ICommand<JwtTokenPair>;

internal sealed class LoginCommandHandler(
    IUserRepository userRepository,
    IJwtTokenProvider jwtTokenProvider,
    IHasher hasher,
    IUnitOfWork unitOfWork,
    IRefreshTokenRepository refreshTokenRepository
) : ICommandHandler<LoginUserCommand, JwtTokenPair>
{
    public async ValueTask<JwtTokenPair> Handle(LoginUserCommand command, CancellationToken cancellationToken)
    {
        var user = await userRepository.GetByIdentifierAsync(command.Identifier);

        if (user == null || !hasher.Verify(command.Password, user.PasswordHash, eHashAlgorithm.BCrypt))
        {
            throw new InvalidCredentialsException("Invalid credentials");
        }

        user.LastLoginAt = DateTimeOffset.UtcNow;
        userRepository.Update(user);

        var rawRefreshToken = jwtTokenProvider.GenerateRefreshToken();
        var refreshToken = new RefreshToken()
        {
            TokenHash = hasher.Hash(rawRefreshToken, eHashAlgorithm.BCrypt),
            UserId = user.Id,
            ExpiresAt = DateTimeOffset.UtcNow.AddDays(14)
        };

        refreshTokenRepository.Add(refreshToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var accessToken = jwtTokenProvider.GenerateAccessToken(user, refreshToken);

        return new JwtTokenPair(accessToken, rawRefreshToken);
    }
}
