using PersonaLite.Application.DTOs;
using PersonaLite.Application.UseCases;

namespace PersonaLite.Api.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this WebApplication app)
    {
        var grupo = app.MapGroup("/api/auth").WithTags("Auth");

        grupo.MapPost("/registrar", async (RegistrarUsuarioDto dto, RegistrarUsuarioUseCase useCase) =>
        {
            try
            {
                var resultado = await useCase.ExecutarAsync(dto);
                return Results.Ok(resultado);
            }
            catch (InvalidOperationException ex)
            {
                return Results.Conflict(new { mensagem = ex.Message });
            }
        });

        grupo.MapPost("/login", async (LoginDto dto, LoginUseCase useCase) =>
        {
            try
            {
                var resultado = await useCase.ExecutarAsync(dto);
                return Results.Ok(resultado);
            }
            catch (InvalidOperationException ex)
            {
                return Results.Unauthorized();
            }
        });
    }
}