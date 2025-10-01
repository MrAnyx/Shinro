using Shinro.Application.Model;
using System;

namespace Shinro.Presentation.Extension;

public static class ResultExtensions
{
    public static TOut Match<TOut>(
        this Result result,
        Func<TOut> onSuccess,
        Func<Error, TOut> onFailure)
    {
        return result.IsSuccess ? onSuccess() : onFailure(result.Error);
    }

    public static TOut Match<TIn, TOut>(
        this Result<TIn> result,
        Func<TIn, TOut> onSuccess,
        Func<Error, TOut> onFailure)
    {
        return result.IsSuccess ? onSuccess(result.Value) : onFailure(result.Error);
    }
}
