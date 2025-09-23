using Microsoft.AspNetCore.Routing;
using System.Text.RegularExpressions;

namespace Shinro.Core.Transformer;

/// <summary>
/// Transforms route tokens (e.g. controller/action names) into kebab-case.
/// Example: "UserProfiles" => "user-profiles"
/// </summary>
public class KebabCaseParameterTransformer : IOutboundParameterTransformer
{
    public string? TransformOutbound(object? value)
    {
        if (value == null)
        {
            return null;
        }

        var str = value.ToString();
        if (string.IsNullOrEmpty(str))
        {
            return str;
        }

        // Insert hyphen between lowercase-uppercase boundaries, then lowercase everything
        return Regex.Replace(str, "([a-z])([A-Z])", "$1-$2").ToLowerInvariant();
    }
}