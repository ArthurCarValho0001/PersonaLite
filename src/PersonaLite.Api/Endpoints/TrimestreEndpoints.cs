using PersonaLite.Application.UseCases;

namespace PersonaLite.Api.Endpoints;

public static class TrimestreEndpoints
{
    public static void MapTrimestreEndpoints(this WebApplication app)
    {
        var grupo = app.MapGroup("/api/trimestre").WithTags("Trimestre").RequireAuthorization();

        grupo.MapPost("/", async (HttpContext http, CriarTrimestreUseCase useCase) =>
        {
            var usuarioId = http.User.ObterUsuarioId();
            var id = await useCase.ExecutarAsync(usuarioId);
            return Results.Created($"/api/trimestre/{id}", new { id });
        });

        grupo.MapGet("/atual", async (HttpContext http, ObterTrimestreAtualUseCase useCase) =>
        {
            var usuarioId = http.User.ObterUsuarioId();
            var trimestre = await useCase.ExecutarAsync(usuarioId);
            return trimestre is not null ? Results.Ok(trimestre) : Results.NotFound();
        });

        grupo.MapGet("/retrospectiva", async (HttpContext http, ObterRetrospectivaUseCase useCase) =>
        {
            var usuarioId = http.User.ObterUsuarioId();
            var retrospectiva = await useCase.ExecutarAsync(usuarioId);
            return retrospectiva is not null ? Results.Ok(retrospectiva) : Results.NotFound();
        });

        grupo.MapGet("/sugestao-troca", async (HttpContext http, ObterSugestaoTrocaTreinoUseCase useCase) =>
        {
            var usuarioId = http.User.ObterUsuarioId();
            var sugestao = await useCase.ExecutarAsync(usuarioId);
            return Results.Ok(sugestao);
        });
    }
}