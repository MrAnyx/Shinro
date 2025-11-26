using Microsoft.EntityFrameworkCore.Migrations;
using System;

#nullable disable

namespace Shinro.Persistence.Migrations;

/// <inheritdoc />
public partial class UpdateReleaseAtProperty : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AlterColumn<DateOnly>(
            name: "ReleasedAt",
            schema: "public",
            table: "MediaItem",
            type: "date",
            nullable: true,
            oldClrType: typeof(DateTimeOffset),
            oldType: "timestamp with time zone",
            oldNullable: true);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AlterColumn<DateTimeOffset>(
            name: "ReleasedAt",
            schema: "public",
            table: "MediaItem",
            type: "timestamp with time zone",
            nullable: true,
            oldClrType: typeof(DateOnly),
            oldType: "date",
            oldNullable: true);
    }
}
