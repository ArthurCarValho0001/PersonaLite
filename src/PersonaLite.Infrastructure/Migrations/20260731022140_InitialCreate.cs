using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PersonaLite.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "FotosProgresso",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RegistroMedidasId = table.Column<Guid>(type: "uuid", nullable: false),
                    Angulo = table.Column<int>(type: "integer", nullable: false),
                    CaminhoArquivo = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FotosProgresso", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PlanosTreino",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UsuarioId = table.Column<Guid>(type: "uuid", nullable: false),
                    InicioVigencia = table.Column<DateOnly>(type: "date", nullable: false),
                    FimVigencia = table.Column<DateOnly>(type: "date", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlanosTreino", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RegistrosMedidas",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UsuarioId = table.Column<Guid>(type: "uuid", nullable: false),
                    Data = table.Column<DateOnly>(type: "date", nullable: false),
                    PesoKg = table.Column<double>(type: "double precision", nullable: false),
                    Circunferencias_PescocoCm = table.Column<double>(type: "double precision", nullable: false),
                    Circunferencias_ToraxMesoesternalCm = table.Column<double>(type: "double precision", nullable: false),
                    Circunferencias_ToraxMamiloCm = table.Column<double>(type: "double precision", nullable: false),
                    Circunferencias_UltimaCostelaCm = table.Column<double>(type: "double precision", nullable: false),
                    Circunferencias_CinturaCm = table.Column<double>(type: "double precision", nullable: false),
                    Circunferencias_QuadrilCm = table.Column<double>(type: "double precision", nullable: false),
                    Circunferencias_BracoEsquerdoCm = table.Column<double>(type: "double precision", nullable: false),
                    Circunferencias_BracoDireitoCm = table.Column<double>(type: "double precision", nullable: false),
                    Circunferencias_AntebracoEsquerdoCm = table.Column<double>(type: "double precision", nullable: false),
                    Circunferencias_AntebracoDireitoCm = table.Column<double>(type: "double precision", nullable: false),
                    Circunferencias_PernaEsquerdaCm = table.Column<double>(type: "double precision", nullable: false),
                    Circunferencias_PernaDireitaCm = table.Column<double>(type: "double precision", nullable: false),
                    Circunferencias_PanturrilhaEsquerdaCm = table.Column<double>(type: "double precision", nullable: false),
                    Circunferencias_PanturrilhaDireitaCm = table.Column<double>(type: "double precision", nullable: false),
                    Dobras_PeitoralMm = table.Column<double>(type: "double precision", nullable: false),
                    Dobras_AxilarMediaMm = table.Column<double>(type: "double precision", nullable: false),
                    Dobras_TricepsMm = table.Column<double>(type: "double precision", nullable: false),
                    Dobras_SubescapularMm = table.Column<double>(type: "double precision", nullable: false),
                    Dobras_AbdominalMm = table.Column<double>(type: "double precision", nullable: false),
                    Dobras_SuprailiacaMm = table.Column<double>(type: "double precision", nullable: false),
                    Dobras_CoxaMm = table.Column<double>(type: "double precision", nullable: false),
                    PercentualGorduraJP7 = table.Column<double>(type: "double precision", nullable: false),
                    Imc = table.Column<double>(type: "double precision", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RegistrosMedidas", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SessoesExercicio",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ExercicioPlanejadoId = table.Column<Guid>(type: "uuid", nullable: false),
                    Data = table.Column<DateOnly>(type: "date", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SessoesExercicio", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Usuarios",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Nome = table.Column<string>(type: "text", nullable: false),
                    Sexo = table.Column<int>(type: "integer", nullable: false),
                    DataNascimento = table.Column<DateOnly>(type: "date", nullable: false),
                    AlturaCm = table.Column<double>(type: "double precision", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Usuarios", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DiasDeTreino",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PlanoTreinoId = table.Column<Guid>(type: "uuid", nullable: false),
                    Nome = table.Column<string>(type: "text", nullable: false),
                    DiaSemana = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DiasDeTreino", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DiasDeTreino_PlanosTreino_PlanoTreinoId",
                        column: x => x.PlanoTreinoId,
                        principalTable: "PlanosTreino",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SerieRealizada",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    GrupoSerie = table.Column<int>(type: "integer", nullable: false),
                    OrdemEstagio = table.Column<int>(type: "integer", nullable: false),
                    CargaKg = table.Column<double>(type: "double precision", nullable: false),
                    Repeticoes = table.Column<int>(type: "integer", nullable: false),
                    SessaoExercicioId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SerieRealizada", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SerieRealizada_SessoesExercicio_SessaoExercicioId",
                        column: x => x.SessaoExercicioId,
                        principalTable: "SessoesExercicio",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ExerciciosPlanejados",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DiaDeTreinoId = table.Column<Guid>(type: "uuid", nullable: false),
                    Nome = table.Column<string>(type: "text", nullable: false),
                    GrupoMuscular = table.Column<string>(type: "text", nullable: false),
                    SeriesAlvo = table.Column<int>(type: "integer", nullable: false),
                    RepeticoesAlvo = table.Column<int>(type: "integer", nullable: false),
                    Ordem = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExerciciosPlanejados", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ExerciciosPlanejados_DiasDeTreino_DiaDeTreinoId",
                        column: x => x.DiaDeTreinoId,
                        principalTable: "DiasDeTreino",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DiasDeTreino_PlanoTreinoId",
                table: "DiasDeTreino",
                column: "PlanoTreinoId");

            migrationBuilder.CreateIndex(
                name: "IX_ExerciciosPlanejados_DiaDeTreinoId",
                table: "ExerciciosPlanejados",
                column: "DiaDeTreinoId");

            migrationBuilder.CreateIndex(
                name: "IX_SerieRealizada_SessaoExercicioId",
                table: "SerieRealizada",
                column: "SessaoExercicioId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ExerciciosPlanejados");

            migrationBuilder.DropTable(
                name: "FotosProgresso");

            migrationBuilder.DropTable(
                name: "RegistrosMedidas");

            migrationBuilder.DropTable(
                name: "SerieRealizada");

            migrationBuilder.DropTable(
                name: "Usuarios");

            migrationBuilder.DropTable(
                name: "DiasDeTreino");

            migrationBuilder.DropTable(
                name: "SessoesExercicio");

            migrationBuilder.DropTable(
                name: "PlanosTreino");
        }
    }
}
