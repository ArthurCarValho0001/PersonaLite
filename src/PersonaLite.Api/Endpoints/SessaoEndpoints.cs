using PersonaLite.Application.DTOs;
using PersonaLite.Application.UseCases;

namespace PersonaLite.Api.Endpoints;

public static class SessaoEndpoints
{
    public static void MapSessaoEndpoints(this WebApplication app)
    {
        // Registra UMA série (normal ou drop set, dependendo de quantos "Estagios" vierem no corpo)
        app.MapPost("/api/series", async (RegistrarSerieDto dto, RegistrarSerieUseCase useCase) =>
        {
            await useCase.ExecutarAsync(dto);
            return Results.NoContent();
        }).WithTags("Sessoes");

        app.MapGet("/api/exercicios/{id:guid}/progressao", async (
            Guid id, ObterProgressaoCargaUseCase useCase) =>
        {
            var progressao = await useCase.ExecutarAsync(id);
            return Results.Ok(progressao);
        }).WithTags("Sessoes");
    }
}
