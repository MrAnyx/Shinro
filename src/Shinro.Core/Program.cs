using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc.ApplicationModels;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using NLog.Web;
using Scalar.AspNetCore;
using Shinro.Application.Contract.Persistence;
using Shinro.Application.Extension;
using Shinro.Core.Convention;
using Shinro.Core.ExceptionHandler;
using Shinro.Core.Middleware;
using Shinro.Core.Transformer;
using Shinro.Infrastructure.Extension;
using Shinro.Persistence.Extension;
using Shinro.Presentation.Extension;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.RateLimiting;
using System.Threading.Tasks;

var builder = WebApplication.CreateBuilder(args);

// Problem details
builder.Services.AddProblemDetails(options =>
{
    options.CustomizeProblemDetails = context =>
    {
        context.ProblemDetails.Instance = $"{context.HttpContext.Request.Method} {context.HttpContext.Request.Path}";
        context.ProblemDetails.Extensions.TryAdd("requestId", context.HttpContext.TraceIdentifier);
        context.ProblemDetails.Extensions.TryAdd("traceId", context.HttpContext.Features.Get<IHttpActivityFeature>()?.Activity?.Id);
    };
});
builder.Services.AddExceptionHandler<ValidationExceptionHandler>();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

// Logging
builder.Logging.ClearProviders();
builder.Host.UseNLog();

// CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
    });
});

// Rate limiter
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: partition => new FixedWindowRateLimiterOptions
            {
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0,
                PermitLimit = 100,
                AutoReplenishment = true,
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
            }));

    options.OnRejected += (context, cancellationToken) =>
    {
        context.HttpContext.Response.Headers.RetryAfter = "60";
        return ValueTask.CompletedTask;
    };
});

// JWT Authentication
builder.Services.AddAuthorization();
builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = true;
        options.SaveToken = false;

        options.TokenValidationParameters = new TokenValidationParameters()
        {
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration.GetValue<string>("Jwt:Secret")!)),
            ValidIssuer = builder.Configuration.GetValue<string>("Jwt:Issuer"),
            ValidAudience = builder.Configuration.GetValue<string>("Jwt:Audience"),
            ClockSkew = System.TimeSpan.Zero,
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidateLifetime = true
        };
    });

// Routing and URLs
builder.Services
    .AddControllers(options =>
    {
        // Apply kebab-case transformation globally to [controller] and [action] tokens
        options.Conventions.Add(new RouteTokenTransformerConvention(new KebabCaseParameterTransformer()));

        // Add the "/api" prefix to all routes
        options.Conventions.Insert(0, new RoutePrefixConvention("api"));
    })
    .AddApplicationPart(typeof(Shinro.Presentation.AssemblyReference).Assembly);

builder.Services.AddRouting(options =>
{
    options.LowercaseUrls = true;
    options.LowercaseQueryStrings = true;
    options.AppendTrailingSlash = false;

    // Constraints
    //options.ConstraintMap["slug"] = typeof(SlugRouteConstraint);
});

builder.Services.AddHealthChecks();

// OpenAPI integration
builder.Services.AddOpenApi();

// Http Context
builder.Services.AddHttpContextAccessor();

// Clean architecture layers
builder.Services
    .AddApplication()
    .AddInfrastructure()
    .AddPersistence(builder.Configuration)
    .AddPresentation();

var app = builder.Build();

// Apply database migrations
using (var scope = app.Services.CreateScope())
{
    var migration = scope.ServiceProvider.GetRequiredService<IMigration>();
    await migration.MigrateAsync();
}

// Middlewares
app.UseHsts();
app.UseHttpsRedirection();
app.UseExceptionHandler();
app.UseMiddleware<RequestLoggingMiddleware>();
app.UseRateLimiter();
app.UseRouting();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

// Endpoint mapping
app.MapControllers();
app.MapOpenApi();
app.MapHealthChecks("/health");

if (app.Environment.IsDevelopment())
{
    // Scalar
    app.MapScalarApiReference(options =>
    {
        options.DarkMode = true;
    });
}

await app.RunAsync();
