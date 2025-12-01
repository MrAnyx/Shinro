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
        config.NewConfig<JwtTokenPair, JwtTokenPairResponse>()
            .Map(dest => dest, src => src);

        config.NewConfig<AuthenticationController.RegisterRequest, RegisterNewUserCommand>()
            .Map(dest => dest, src => src);

        config.NewConfig<AuthenticationController.LoginRequest, LoginUserCommand>()
            .Map(dest => dest, src => src);

        config.NewConfig<AuthenticationController.RefreshTokenRequest, RefreshTokenCommand>()
            .Map(dest => dest, src => src);
    }
}
