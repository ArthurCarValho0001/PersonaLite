using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PersonaLite.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class V2AprendizagemIntegridade : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "VersaoSessao",
                table: "Usuarios",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "EntradasCalculoJson",
                table: "RegistrosMedidas",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VersaoFormula",
                table: "RegistrosMedidas",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Arquivado",
                table: "ExerciciosPlanejados",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "ModulosVersoes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ModuloId = table.Column<string>(type: "text", nullable: false),
                    Versao = table.Column<int>(type: "integer", nullable: false),
                    Titulo = table.Column<string>(type: "text", nullable: false),
                    Objetivo = table.Column<string>(type: "text", nullable: false),
                    Autoria = table.Column<string>(type: "text", nullable: false),
                    Revisao = table.Column<string>(type: "text", nullable: false),
                    PublicadoEm = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Retirada = table.Column<bool>(type: "boolean", nullable: false),
                    Demonstracao = table.Column<bool>(type: "boolean", nullable: false),
                    ConteudoJson = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ModulosVersoes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "OperacoesProcessadas",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UsuarioId = table.Column<Guid>(type: "uuid", nullable: false),
                    Chave = table.Column<string>(type: "text", nullable: false),
                    Rota = table.Column<string>(type: "text", nullable: false),
                    Hash = table.Column<string>(type: "text", nullable: false),
                    Resposta = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    CriadaEm = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OperacoesProcessadas", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AulasEstudadas",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UsuarioId = table.Column<Guid>(type: "uuid", nullable: false),
                    ModuloVersaoId = table.Column<Guid>(type: "uuid", nullable: false),
                    AulaId = table.Column<string>(type: "text", nullable: false),
                    EstudadaEm = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AulasEstudadas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AulasEstudadas_ModulosVersoes_ModuloVersaoId",
                        column: x => x.ModuloVersaoId,
                        principalTable: "ModulosVersoes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AulasEstudadas_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TentativasEducativas",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UsuarioId = table.Column<Guid>(type: "uuid", nullable: false),
                    ModuloVersaoId = table.Column<Guid>(type: "uuid", nullable: false),
                    Nota = table.Column<int>(type: "integer", nullable: false),
                    EnviadaEm = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    RespostasJson = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TentativasEducativas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TentativasEducativas_ModulosVersoes_ModuloVersaoId",
                        column: x => x.ModuloVersaoId,
                        principalTable: "ModulosVersoes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TentativasEducativas_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AulasEstudadas_ModuloVersaoId",
                table: "AulasEstudadas",
                column: "ModuloVersaoId");

            migrationBuilder.CreateIndex(
                name: "IX_AulasEstudadas_UsuarioId_ModuloVersaoId_AulaId",
                table: "AulasEstudadas",
                columns: new[] { "UsuarioId", "ModuloVersaoId", "AulaId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ModulosVersoes_ModuloId_Versao",
                table: "ModulosVersoes",
                columns: new[] { "ModuloId", "Versao" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OperacoesProcessadas_UsuarioId_Chave",
                table: "OperacoesProcessadas",
                columns: new[] { "UsuarioId", "Chave" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TentativasEducativas_ModuloVersaoId",
                table: "TentativasEducativas",
                column: "ModuloVersaoId");

            migrationBuilder.CreateIndex(
                name: "IX_TentativasEducativas_UsuarioId_ModuloVersaoId",
                table: "TentativasEducativas",
                columns: new[] { "UsuarioId", "ModuloVersaoId" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            throw new NotSupportedException("Rollback destrutivo bloqueado: preserve o esquema e restaure somente em banco isolado após backup e revisão.");
        }
    }
}
