using Shinro.Domain.Enum;

namespace Shinro.Domain.Model;

public record Error(string Code, string Description, eErrorType Type)
{
    public static readonly Error None = new(string.Empty, string.Empty, eErrorType.Failure);

    public static Error Failure(string code, string description) => new(code, description, eErrorType.Failure);
    public static Error Validation(string code, string description) => new(code, description, eErrorType.Validation);
    public static Error NotFound(string code, string description) => new(code, description, eErrorType.NotFound);
    public static Error Conflict(string code, string description) => new(code, description, eErrorType.Conflict);
}