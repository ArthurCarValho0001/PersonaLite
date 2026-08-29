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
            catch (InvalidOperationException)
            {
                return Results.Unauthorized();
            }
        });

        grupo.MapPost("/esqueci-senha", async (SolicitarRedefinicaoSenhaDto dto, SolicitarRedefinicaoSenhaUseCase useCase) =>
        {
            await useCase.ExecutarAsync(dto);
            // Sempre retorna sucesso, exista ou não o e-mail — evita revelar quais e-mails têm conta.
            return Results.NoContent();
        });

        grupo.MapPost("/redefinir-senha", async (RedefinirSenhaDto dto, RedefinirSenhaUseCase useCase) =>
        {
            try
            {
                await useCase.ExecutarAsync(dto);
                return Results.NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(new { mensagem = ex.Message });
            }
        });
    }
}