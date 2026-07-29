using PersonaLite.Application.DTOs;
using PersonaLite.Application.UseCases;

namespace PersonaLite.Api.Endpoints;

public static class TreinoEndpoints
{
    public static void MapTreinoEndpoints(this WebApplication app)
    {
        var planos = app.MapGroup("/api/planos-treino").WithTags("PlanoTreino");

        planos.MapPost("/", async (CriarPlanoTreinoDto dto, CriarPlanoTreinoUseCase useCase) =>
        {
            var id = await useCase.ExecutarAsync(dto);
            return Results.Created($"/api/planos-treino/{id}", new { id });
        });

        planos.MapGet("/atual", async (ObterPlanoVigenteUseCase useCase) =>
        {
            var plano = await useCase.ExecutarAsync();
            return plano is not null ? Results.Ok(plano) : Results.NotFound();
        });

        planos.MapPost("/{id:guid}/dias", async (
            Guid id, AdicionarDiaDeTreinoDto dto, AdicionarDiaDeTreinoUseCase useCase) =>
        {
            try
            {
                var diaId = await useCase.ExecutarAsync(id, dto);
                return Results.Created($"/api/dias-treino/{diaId}", new { id = diaId });
            }
            catch (InvalidOperationException ex)
            {
                // Use NotFound quando o use case não encontrou o plano
                return Results.NotFound(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                // Evita 500 sem mensagem; em produção você pode logar o erro e retornar um problema genérico
                return Results.Problem(detail: ex.Message);
            }
        });

        app.MapPost("/api/dias-treino/{id:guid}/exercicios", async (
            Guid id, AdicionarExercicioDto dto, AdicionarExercicioUseCase useCase) =>
        {
            var exercicioId = await useCase.ExecutarAsync(id, dto);
            return Results.Created($"/api/exercicios/{exercicioId}", new { id = exercicioId });
        }).WithTags("PlanoTreino");

        // Endpoint central: "o que eu devo treinar hoje, e o que já registrei hoje"
        app.MapGet("/api/treino-do-dia", async (DateOnly? data, ObterTreinoDoDiaUseCase useCase) =>
        {
            var treinoDoDia = await useCase.ExecutarAsync(data);
            return Results.Ok(treinoDoDia);
        }).WithTags("PlanoTreino");
    }
}