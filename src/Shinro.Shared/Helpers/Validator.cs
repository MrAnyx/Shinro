using RecursiveDataAnnotationsValidation;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;

namespace Shinro.Shared.Helpers;

public static class Validator
{
    public static void Validate(object obj)
    {
        var validator = new RecursiveDataAnnotationValidator();
        var results = new List<ValidationResult>();

        if (!validator.TryValidateObjectRecursive(obj, results))
        {
            var errorMessages = string.Join(Environment.NewLine, results.ConvertAll(r => r.ErrorMessage));
            throw new ValidationException($"Configuration validation failed:{Environment.NewLine}{errorMessages}");
        }
    }

    public static bool TryValidate(object obj, [NotNullWhen(false)] out Exception? exception)
    {
        try
        {
            Validate(obj);
            exception = null;
            return true;
        }
        catch (Exception ex)
        {
            exception = ex;
            return false;
        }
    }
}