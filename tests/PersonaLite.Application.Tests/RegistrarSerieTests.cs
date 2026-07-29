using Microsoft.EntityFrameworkCore;
using PersonaLite.Application.DTOs;
using PersonaLite.Application.UseCases;
using PersonaLite.Domain.Entities;
using PersonaLite.Domain.Enums;
using PersonaLite.Infrastructure.Data;
using PersonaLite.Infrastructure.Repositories;

namespace PersonaLite.Application.Tests;

public class RegistrarSerieTests
{
    [Fact]
    public async Task RegistrarSerie_cria_sessao_e_persiste_estagios()
    {
        var options = new DbContextOptionsBuilder<PersonaLiteDbContext>()
            .UseSqlite("Data Source=:memory:")
            .Options;

        await using var context = new PersonaLiteDbContext(options);
        await context.Database.OpenConnectionAsync();
        await context.Database.EnsureCreatedAsync();

        var usuario = new Usuario("Arthur", Sexo.Masculino, new DateOnly(1990, 1, 1), 180);
        context.Usuarios.Add(usuario);

        var plano = new PlanoTreino(usuario.Id, new DateOnly(2026, 7, 29));
        var dia = plano.AdicionarDia("Peito", DayOfWeek.Monday);
        var exercicio = new ExercicioPlanejado(dia.Id, "Supino", "Peito", 4, 10, 0);
        dia.AdicionarExercicio(exercicio);

        context.PlanosTreino.Add(plano);
        await context.SaveChangesAsync();

        var repo = new SessaoExercicioRepository(context);
        var useCase = new RegistrarSerieUseCase(repo);

        await useCase.ExecutarAsync(new RegistrarSerieDto(
            exercicio.Id,
            new DateOnly(2026, 7, 29),
            [new EstagioSerieDto(40, 10), new EstagioSerieDto(35, 8)]));

        var sessoes = await context.SessoesExercicio
            .Include(s => s.Series)
            .AsNoTracking()
            .ToListAsync();

        Assert.Single(sessoes);
        Assert.Equal(2, sessoes[0].Series.Count);
        Assert.Equal(1, sessoes[0].Series[0].GrupoSerie);
        Assert.Equal(1, sessoes[0].Series[1].GrupoSerie);
    }

    [Fact]
    public async Task RegistrarSerie_adiciona_serie_em_sessao_existente()
    {
        var options = new DbContextOptionsBuilder<PersonaLiteDbContext>()
            .UseSqlite("Data Source=:memory:")
            .Options;

        await using var context = new PersonaLiteDbContext(options);
        await context.Database.OpenConnectionAsync();
        await context.Database.EnsureCreatedAsync();

        var usuario = new Usuario("Arthur", Sexo.Masculino, new DateOnly(1990, 1, 1), 180);
        context.Usuarios.Add(usuario);

        var plano = new PlanoTreino(usuario.Id, new DateOnly(2026, 7, 29));
        var dia = plano.AdicionarDia("Peito", DayOfWeek.Monday);
        var exercicio = new ExercicioPlanejado(dia.Id, "Supino", "Peito", 4, 10, 0);
        dia.AdicionarExercicio(exercicio);

        context.PlanosTreino.Add(plano);
        await context.SaveChangesAsync();

        var repo = new SessaoExercicioRepository(context);
        var useCase = new RegistrarSerieUseCase(repo);
        var data = new DateOnly(2026, 7, 29);

        await useCase.ExecutarAsync(new RegistrarSerieDto(
            exercicio.Id, data, [new EstagioSerieDto(40, 10)]));

        await useCase.ExecutarAsync(new RegistrarSerieDto(
            exercicio.Id, data, [new EstagioSerieDto(42, 8)]));

        var sessao = await context.SessoesExercicio
            .Include(s => s.Series)
            .AsNoTracking()
            .SingleAsync();

        Assert.Equal(2, sessao.Series.Count);
        Assert.Equal(1, sessao.Series[0].GrupoSerie);
        Assert.Equal(2, sessao.Series[1].GrupoSerie);
    }
}
