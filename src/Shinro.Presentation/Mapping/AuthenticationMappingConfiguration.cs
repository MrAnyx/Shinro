using Mapster;
using Shinro.Application.UseCases.Authentication;
using Shinro.Domain.Models;
using Shinro.Presentation.Controllers;

namespace Shinro.Presentation.Mapping;

public class AuthenticationMappingConfiguration : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        #region Request to command
        config.NewConfig<AuthenticationController.RegisterRequest, RegisterNewUserCommand>()
            .Map(dest => dest.Username, src => src.Username)
            .Map(dest => dest.Password, src => src.Password)
            .Map(dest => dest.Email, src => src.Email)
            .TwoWays();

        config.NewConfig<AuthenticationController.LoginRequest, LoginUserCommand>()
            .Map(dest => dest.Identifier, src => src.Identifier)
            .Map(dest => dest.Password, src => src.Password)
            .TwoWays();

        config.NewConfig<AuthenticationController.RefreshTokenRequest, RefreshTokenCommand>()
            .Map(dest => dest.AccessToken, src => src.AccessToken)
            .Map(dest => dest.RefreshToken, src => src.RefreshToken)
            .TwoWays();
        #endregion

        #region Command result to response
        config.NewConfig<JwtTokenPair, AuthenticationController.RegisterResponse>()
            .Map(dest => dest.AccessToken, src => src.AccessToken)
            .Map(dest => dest.RefreshToken, src => src.RefreshToken)
            .TwoWays();

        config.NewConfig<JwtTokenPair, AuthenticationController.LoginResponse>()
            .Map(dest => dest.AccessToken, src => src.AccessToken)
            .Map(dest => dest.RefreshToken, src => src.RefreshToken)
            .TwoWays();

        config.NewConfig<JwtTokenPair, AuthenticationController.RefreshTokenResponse>()
            .Map(dest => dest.AccessToken, src => src.AccessToken)
            .Map(dest => dest.RefreshToken, src => src.RefreshToken)
            .TwoWays();
        #endregion
    }
}
