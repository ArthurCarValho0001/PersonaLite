using PersonaLite.Application.DTOs;
using PersonaLite.Application.UseCases;

namespace PersonaLite.Api.Endpoints;

public static class UsuarioEndpoints
{
    public static void MapUsuarioEndpoints(this WebApplication app)
    {
        var grupo = app.MapGroup("/api/usuario").WithTags("Usuario");

        grupo.MapPost("/", async (CriarUsuarioDto dto, CriarUsuarioUseCase useCase) =>
        {
            var id = await useCase.ExecutarAsync(dto);
            return Results.Created($"/api/usuario/{id}", new { id });
        });

        grupo.MapGet("/", async (ObterUsuarioUseCase useCase) =>
        {
            var usuario = await useCase.ExecutarAsync();
            return usuario is not null ? Results.Ok(usuario) : Results.NotFound();
        });
    }
}
