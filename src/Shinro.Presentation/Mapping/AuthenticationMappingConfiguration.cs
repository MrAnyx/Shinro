using Mapster;
using Shinro.Application.UseCases.Authentication;
using Shinro.Domain.Models;
using Shinro.Presentation.Controllers;
using Shinro.Presentation.Models.Authentication;

namespace Shinro.Presentation.Mapping;

internal sealed class AuthenticationMappingConfiguration : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<JwtTokenPair, JwtTokenPairResponse>();

        config.NewConfig<AuthenticationController.RegisterRequest, RegisterNewUserCommand>();
        config.NewConfig<AuthenticationController.LoginRequest, LoginUserCommand>();
        config.NewConfig<AuthenticationController.RefreshTokenRequest, RefreshTokenCommand>();
    }
}
