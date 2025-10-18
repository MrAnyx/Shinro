using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Threading.Tasks;

namespace Shinro.Core.Middlewares;

internal sealed class RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
{
    public static IPAddress AnonymizeIp(IPAddress ip)
    {
        if (IPAddress.IsLoopback(ip))
        {
            return IPAddress.Loopback;
        }

        if (ip.AddressFamily == System.Net.Sockets.AddressFamily.InterNetwork) // IPv4
        {
            var bytes = ip.GetAddressBytes();
            bytes[3] = 0; // zero out last octet
            return new IPAddress(bytes);
        }
        else if (ip.AddressFamily == System.Net.Sockets.AddressFamily.InterNetworkV6) // IPv6
        {
            var bytes = ip.GetAddressBytes();
            for (var i = 8; i < 16; i++) // zero out lower 64 bits
            {
                bytes[i] = 0;
            }

            return new IPAddress(bytes);
        }

        return IPAddress.None;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var request = context.Request;
        var ip = request.HttpContext.Connection.RemoteIpAddress;

        logger.LogInformation("{Ip} {Method} {Url}",
            AnonymizeIp(ip ?? IPAddress.None),
            request.Method,
            request.GetDisplayUrl()
        );

        await next(context);
    }
}
