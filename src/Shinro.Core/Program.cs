using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Mvc.ApplicationModels;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using NLog.Extensions.Logging;
using Scalar.AspNetCore;
using Shinro.Application.Contract.Persistence;
using Shinro.Application.Extension;
using Shinro.Core.Convention;
using Shinro.Core.Transformer;
using Shinro.Infrastructure.Extension;
using Shinro.Persistence.Extension;
using Shinro.Presentation.Extension;

var builder = WebApplication.CreateBuilder(args);

// Logging
builder.Logging.ClearProviders();
builder.Logging.AddNLog();

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

// OpenAPI integration
builder.Services.AddOpenApi();

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
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.MapOpenApi();

if (app.Environment.IsDevelopment())
{
    // Scalar
    app.MapScalarApiReference(options =>
    {
        options.DarkMode = true;
    });
}

await app.RunAsync();
