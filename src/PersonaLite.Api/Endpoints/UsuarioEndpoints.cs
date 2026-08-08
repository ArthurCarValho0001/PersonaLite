using PersonaLite.Application.DTOs;
using PersonaLite.Application.UseCases;

namespace PersonaLite.Api.Endpoints;

public static class UsuarioEndpoints
{
    public static void MapUsuarioEndpoints(this WebApplication app)
    {
        var grupo = app.MapGroup("/api/usuario").WithTags("Usuario").RequireAuthorization();

        grupo.MapGet("/", async (HttpContext http, ObterUsuarioUseCase useCase) =>
        {
            var usuarioId = http.User.ObterUsuarioId();
            var usuario = await useCase.ExecutarAsync(usuarioId);
            return usuario is not null ? Results.Ok(usuario) : Results.NotFound();
        });

        grupo.MapPut("/tempo-descanso", async (
            HttpContext http, AtualizarTempoDescansoDto dto, AtualizarTempoDescansoUseCase useCase) =>
        {
            var usuarioId = http.User.ObterUsuarioId();
            await useCase.ExecutarAsync(usuarioId, dto);
            return Results.NoContent();
        });
    }
}