namespace Shinro.Presentation.Contract.Authentication;

public class RegisterDTO
{
    public required string Username { get; init; }
    public required string Email { get; init; }
    public required string Password { get; init; }
}
