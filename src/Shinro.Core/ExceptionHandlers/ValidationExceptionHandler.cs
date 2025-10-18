using FluentValidation;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Shinro.Core.ExceptionHandlers;

internal sealed class ValidationExceptionHandler(IProblemDetailsService problemDetailsService) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        if (exception is not ValidationException validationException)
        {
            return false;
        }

        var errors = validationException.Errors
            .GroupBy(e => e.PropertyName)
            .ToDictionary(
                g => g.Key.ToLowerInvariant(),
                g => g.Select(e => new
                {
                    Message = e.ErrorMessage,
                    Code = e.ErrorCode
                }).ToArray()
            );

        httpContext.Response.StatusCode = StatusCodes.Status400BadRequest;

        var problemDetails = new ProblemDetails()
        {
            Detail = "One or more validation errors occurred",
        };

        problemDetails.Extensions.TryAdd("errors", errors);

        return await problemDetailsService.TryWriteAsync(new ProblemDetailsContext()
        {
            Exception = exception,
            HttpContext = httpContext,
            ProblemDetails = problemDetails
        });
    }
}
