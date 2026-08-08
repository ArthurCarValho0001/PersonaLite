using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PersonaLite.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AdicionaTempoDescanso : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "TempoDescansoSegundos",
                table: "Usuarios",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TempoDescansoSegundos",
                table: "Usuarios");
        }
    }
}
