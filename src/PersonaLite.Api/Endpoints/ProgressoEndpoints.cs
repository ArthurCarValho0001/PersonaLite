using PersonaLite.Application.UseCases;

namespace PersonaLite.Api.Endpoints;

public static class ProgressoEndpoints
{
    public static void MapProgressoEndpoints(this WebApplication app)
    {
        app.MapGet("/api/progresso/resumo", async (HttpContext http, ObterResumoProgressoUseCase useCase) =>
        {
            var usuarioId = http.User.ObterUsuarioId();
            var resumo = await useCase.ExecutarAsync(usuarioId);
            return Results.Ok(resumo);
        }).WithTags("Progresso").RequireAuthorization();
    }
}