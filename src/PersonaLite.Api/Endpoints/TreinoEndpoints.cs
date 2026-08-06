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

        var dias = app.MapGroup("/api/dias-treino").WithTags("PlanoTreino").RequireAuthorization();

        dias.MapPut("/{id:guid}", async (
            HttpContext http, Guid id, AtualizarDiaDeTreinoDto dto, AtualizarDiaDeTreinoUseCase useCase) =>
        {
            var usuarioId = http.User.ObterUsuarioId();
            await useCase.ExecutarAsync(usuarioId, id, dto);
            return Results.NoContent();
        });

        dias.MapPost("/{id:guid}/exercicios", async (
            HttpContext http, Guid id, AdicionarExercicioDto dto, AdicionarExercicioUseCase useCase) =>
        {
            var usuarioId = http.User.ObterUsuarioId();
            var exercicioId = await useCase.ExecutarAsync(usuarioId, id, dto);
            return Results.Created($"/api/exercicios/{exercicioId}", new { id = exercicioId });
        });

        dias.MapPut("/{id:guid}/exercicios/ordem", async (
            HttpContext http, Guid id, ReordenarExerciciosDto dto, ReordenarExerciciosUseCase useCase) =>
        {
            var usuarioId = http.User.ObterUsuarioId();
            await useCase.ExecutarAsync(usuarioId, id, dto);
            return Results.NoContent();
        });

        dias.MapGet("/{id:guid}/treino-do-dia", async (
            HttpContext http, Guid id, DateOnly? data, ObterTreinoPorDiaUseCase useCase) =>
        {
            var usuarioId = http.User.ObterUsuarioId();
            var treino = await useCase.ExecutarAsync(usuarioId, id, data);
            return Results.Ok(treino);
        });

        var exercicios = app.MapGroup("/api/exercicios").WithTags("PlanoTreino").RequireAuthorization();

        exercicios.MapPut("/{id:guid}", async (
            HttpContext http, Guid id, AtualizarExercicioDto dto, AtualizarExercicioUseCase useCase) =>
        {
            var usuarioId = http.User.ObterUsuarioId();
            await useCase.ExecutarAsync(usuarioId, id, dto);
            return Results.NoContent();
        });

        exercicios.MapDelete("/{id:guid}", async (
            HttpContext http, Guid id, RemoverExercicioUseCase useCase) =>
        {
            var usuarioId = http.User.ObterUsuarioId();
            await useCase.ExecutarAsync(usuarioId, id);
            return Results.NoContent();
        });

        app.MapGet("/api/treino-do-dia", async (HttpContext http, DateOnly? data, ObterTreinoDoDiaUseCase useCase) =>
        {
            var usuarioId = http.User.ObterUsuarioId();
            var treinoDoDia = await useCase.ExecutarAsync(usuarioId, data);
            return Results.Ok(treinoDoDia);
        }).WithTags("PlanoTreino").RequireAuthorization();
    }
}