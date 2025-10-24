using FluentValidation;
using Mediator;
using Shinro.Application.Contracts;
using Shinro.Application.Contracts.Persistence;
using Shinro.Application.Contracts.Persistence.Repository;
using Shinro.Domain.Entities;
using Shinro.Domain.Enums;
using Shinro.Domain.Exceptions.User;
using Shinro.Domain.Models;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Shinro.Application.UseCases.Authentication;

public sealed class RegisterCommandValidator : AbstractValidator<RegisterNewUserCommand>
{
    public RegisterCommandValidator()
    {
        RuleFor(x => x.Username)
            .NotEmpty()
            .MinimumLength(3)
            .MaximumLength(255);

        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress()
            .MinimumLength(3)
            .MaximumLength(255);

        RuleFor(x => x.Password)
            .NotEmpty()
            .MinimumLength(8);
    }
}

public sealed record RegisterNewUserCommand(
    string Username,
    string Email,
    string Password
) : ICommand<JwtTokenPair>;

internal sealed class RegisterNewUserCommandHandler(
    IHasher passwordHasher,
    IUnitOfWork unitOfWork,
    IUserRepository userRepository,
    IRefreshTokenRepository refreshTokenRepository,
    IJwtTokenProvider jwtTokenService
) : ICommandHandler<RegisterNewUserCommand, JwtTokenPair>
{
    public async ValueTask<JwtTokenPair> Handle(RegisterNewUserCommand command, CancellationToken cancellationToken)
    {
        if (await userRepository.EmailExistAsync(command.Email))
        {
            throw new EmailAlreadyExistException($"Email '{command.Email}' already exist in the database");
        }

        if (await userRepository.UsernameExistAsync(command.Username))
        {
            throw new UsernameAlreadyExistException($"Username '{command.Username}' already exist in the database");
        }

        var user = new User
        {
            Email = command.Email,
            PasswordHash = passwordHasher.Hash(command.Password, eHashAlgorithm.BCrypt),
            Username = command.Username,
            LastLoginAt = DateTimeOffset.UtcNow,
        };

        userRepository.Add(user);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var rawRefreshToken = jwtTokenService.GenerateRefreshToken();
        var refreshToken = new RefreshToken()
        {
            TokenHash = passwordHasher.Hash(rawRefreshToken, eHashAlgorithm.BCrypt),
            UserId = user.Id,
            ExpiresAt = DateTimeOffset.UtcNow.AddDays(14)
        };

        refreshTokenRepository.Add(refreshToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var accessToken = jwtTokenService.GenerateAccessToken(user, refreshToken);

        return new JwtTokenPair(accessToken, rawRefreshToken);
    }
}
