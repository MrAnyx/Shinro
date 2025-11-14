using Mapster;
using Shinro.Application.UseCases.Authentication;
using Shinro.Domain.Models;
using Shinro.Presentation.Controllers;

namespace Shinro.Presentation.Mapping;

internal sealed class AuthenticationMappingConfiguration : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        #region Register
        config.NewConfig<AuthenticationController.RegisterRequest, RegisterNewUserCommand>().TwoWays();
        config.NewConfig<JwtTokenPair, AuthenticationController.RegisterResponse>().TwoWays();
        #endregion

        #region Login
        config.NewConfig<AuthenticationController.LoginRequest, LoginUserCommand>().TwoWays();
        config.NewConfig<JwtTokenPair, AuthenticationController.LoginResponse>().TwoWays();
        #endregion

        #region Refresh token
        config.NewConfig<AuthenticationController.RefreshTokenRequest, RefreshTokenCommand>().TwoWays();
        config.NewConfig<JwtTokenPair, AuthenticationController.RefreshTokenResponse>().TwoWays();
        #endregion
    }
}
