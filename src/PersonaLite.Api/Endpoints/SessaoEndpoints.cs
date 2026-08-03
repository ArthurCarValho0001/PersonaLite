using PersonaLite.Application.DTOs;
using PersonaLite.Application.UseCases;

namespace PersonaLite.Api.Endpoints;

public static class SessaoEndpoints
{
    public static void MapSessaoEndpoints(this WebApplication app)
    {
        app.MapPost("/api/series", async (HttpContext http, RegistrarSerieDto dto, RegistrarSerieUseCase useCase) =>
        {
            var usuarioId = http.User.ObterUsuarioId();
            await useCase.ExecutarAsync(usuarioId, dto);
            return Results.NoContent();
        }).WithTags("Sessoes").RequireAuthorization();

        app.MapGet("/api/exercicios/{id:guid}/progressao", async (
            HttpContext http, Guid id, ObterProgressaoCargaUseCase useCase) =>
        {
            var usuarioId = http.User.ObterUsuarioId();
            var progressao = await useCase.ExecutarAsync(usuarioId, id);
            return Results.Ok(progressao);
        }).WithTags("Sessoes").RequireAuthorization();
    }
}