using Microsoft.EntityFrameworkCore;
using PersonaLite.Application.DTOs;
using PersonaLite.Application.UseCases;
using PersonaLite.Domain.Entities;
using PersonaLite.Infrastructure.Data;
using PersonaLite.Infrastructure.Repositories;

namespace PersonaLite.Application.Tests;

public class AdicionarDiaDeTreinoTests
{
    [Fact]
    public async Task AdicionarDiaDeTreino_persiste_dia_com_id_gerado_no_dominio()
    {
        var options = new DbContextOptionsBuilder<PersonaLiteDbContext>()
            .UseSqlite("Data Source=:memory:")
            .Options;

        await using var context = new PersonaLiteDbContext(options);
        await context.Database.OpenConnectionAsync();
        await context.Database.EnsureCreatedAsync();

        var usuario = new Usuario("Arthur", Domain.Enums.Sexo.Masculino, new DateOnly(1990, 1, 1), 180);
        context.Usuarios.Add(usuario);

        var plano = new PlanoTreino(usuario.Id, new DateOnly(2026, 7, 29));
        context.PlanosTreino.Add(plano);
        await context.SaveChangesAsync();

        var repo = new PlanoTreinoRepository(context);
        var useCase = new AdicionarDiaDeTreinoUseCase(repo);

        var diaId = await useCase.ExecutarAsync(
            plano.Id,
            new AdicionarDiaDeTreinoDto("Peito", DayOfWeek.Monday));

        var dias = await context.DiasDeTreino.AsNoTracking().ToListAsync();
        Assert.Single(dias);
        Assert.Equal(diaId, dias[0].Id);
        Assert.Equal("Peito", dias[0].Nome);
        Assert.Equal(DayOfWeek.Monday, dias[0].DiaSemana);
    }
}
