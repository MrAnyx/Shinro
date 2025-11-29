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
            .ConstructUsing(src => new JwtTokenPairResponse(AccessToken: src.AccessToken, RefreshToken: src.RefreshToken));

        config.NewConfig<AuthenticationController.RegisterRequest, RegisterNewUserCommand>()
            .ConstructUsing(src => new RegisterNewUserCommand(src.Username, src.Email, src.Password));

        config.NewConfig<AuthenticationController.LoginRequest, LoginUserCommand>()
            .ConstructUsing(src => new LoginUserCommand(src.Identifier, src.Password));

        config.NewConfig<AuthenticationController.RefreshTokenRequest, RefreshTokenCommand>()
            .ConstructUsing(src => new RefreshTokenCommand(src.AccessToken, src.RefreshToken));
    }
}
