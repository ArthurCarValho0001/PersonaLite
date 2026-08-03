using PersonaLite.Application.DTOs;
using PersonaLite.Application.UseCases;

namespace PersonaLite.Api.Endpoints;

public static class TreinoEndpoints
{
    public static void MapTreinoEndpoints(this WebApplication app)
    {
        var planos = app.MapGroup("/api/planos-treino").WithTags("PlanoTreino").RequireAuthorization();

        planos.MapPost("/", async (HttpContext http, CriarPlanoTreinoDto dto, CriarPlanoTreinoUseCase useCase) =>
        {
            var usuarioId = http.User.ObterUsuarioId();
            var id = await useCase.ExecutarAsync(usuarioId, dto);
            return Results.Created($"/api/planos-treino/{id}", new { id });
        });

        planos.MapGet("/atual", async (HttpContext http, ObterPlanoVigenteUseCase useCase) =>
        {
            var usuarioId = http.User.ObterUsuarioId();
            var plano = await useCase.ExecutarAsync(usuarioId);
            return plano is not null ? Results.Ok(plano) : Results.NotFound();
        });

        planos.MapPost("/{id:guid}/dias", async (
            HttpContext http, Guid id, AdicionarDiaDeTreinoDto dto, AdicionarDiaDeTreinoUseCase useCase) =>
        {
            var usuarioId = http.User.ObterUsuarioId();
            var diaId = await useCase.ExecutarAsync(usuarioId, id, dto);
            return Results.Created($"/api/dias-treino/{diaId}", new { id = diaId });
        });

        app.MapPost("/api/dias-treino/{id:guid}/exercicios", async (
            HttpContext http, Guid id, AdicionarExercicioDto dto, AdicionarExercicioUseCase useCase) =>
        {
            var usuarioId = http.User.ObterUsuarioId();
            var exercicioId = await useCase.ExecutarAsync(usuarioId, id, dto);
            return Results.Created($"/api/exercicios/{exercicioId}", new { id = exercicioId });
        }).WithTags("PlanoTreino").RequireAuthorization();

        app.MapGet("/api/treino-do-dia", async (HttpContext http, DateOnly? data, ObterTreinoDoDiaUseCase useCase) =>
        {
            var usuarioId = http.User.ObterUsuarioId();
            var treinoDoDia = await useCase.ExecutarAsync(usuarioId, data);
            return Results.Ok(treinoDoDia);
        }).WithTags("PlanoTreino").RequireAuthorization();
    }
}