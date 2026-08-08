using PersonaLite.Application.UseCases;

namespace PersonaLite.Api.Endpoints;

public static class RetrospectivaEndpoints
{
    public static void MapRetrospectivaEndpoints(this WebApplication app)
    {
        app.MapGet("/api/retrospectiva", async (HttpContext http, ObterRetrospectivaDetalhadaUseCase useCase) =>
        {
            var usuarioId = http.User.ObterUsuarioId();
            var retrospectiva = await useCase.ExecutarAsync(usuarioId);
            return retrospectiva is not null ? Results.Ok(retrospectiva) : Results.NotFound();
        }).WithTags("Retrospectiva").RequireAuthorization();
    }
}