using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Shinro.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddIsRevokedOnRefreshToken : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsRevoked",
                schema: "public",
                table: "RefreshToken",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsRevoked",
                schema: "public",
                table: "RefreshToken");
        }
    }
}
