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
        config.NewConfig<AuthenticationController.RegisterRequest, RegisterNewUserCommand>().TwoWays();
        config.NewConfig<AuthenticationController.LoginRequest, LoginUserCommand>().TwoWays();
        config.NewConfig<AuthenticationController.RefreshTokenRequest, RefreshTokenCommand>().TwoWays();
        #endregion

        #region Command result to response
        config.NewConfig<JwtTokenPair, AuthenticationController.RegisterResponse>().TwoWays();
        config.NewConfig<JwtTokenPair, AuthenticationController.LoginResponse>().TwoWays();
        config.NewConfig<JwtTokenPair, AuthenticationController.RefreshTokenResponse>().TwoWays();
        #endregion
    }
}
