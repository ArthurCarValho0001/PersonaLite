using PersonaLite.Application.DTOs;
using PersonaLite.Application.UseCases;
using PersonaLite.Domain.Entities;

namespace PersonaLite.Api.Endpoints;

public static class MedidasEndpoints
{
    public static void MapMedidasEndpoints(this WebApplication app)
    {
        var grupo = app.MapGroup("/api/medidas").WithTags("Medidas").RequireAuthorization();

        grupo.MapPost("/", async (HttpContext http, CriarRegistroMedidasDto dto, RegistrarMedidasUseCase useCase) =>
        {
            var usuarioId = http.User.ObterUsuarioId();
            var id = await useCase.ExecutarAsync(usuarioId, dto);
            return Results.Created($"/api/medidas/{id}", new { id });
        });

        grupo.MapGet("/", async (HttpContext http, ObterEvolucaoUseCase useCase) =>
        {
            var usuarioId = http.User.ObterUsuarioId();
            var evolucao = await useCase.ExecutarAsync(usuarioId);
            return Results.Ok(evolucao);
        });

        grupo.MapGet("/{id:guid}", async (HttpContext http, Guid id, ObterMedidaUseCase useCase) =>
        {
            var usuarioId = http.User.ObterUsuarioId();
            var registro = await useCase.ExecutarAsync(usuarioId, id);
            return registro is not null ? Results.Ok(registro) : Results.NotFound();
        });

        grupo.MapPut("/{id:guid}", async (HttpContext http, Guid id, CriarRegistroMedidasDto dto, AtualizarMedidasUseCase useCase) =>
        {
            var usuarioId = http.User.ObterUsuarioId();
            await useCase.ExecutarAsync(usuarioId, id, dto);
            return Results.NoContent();
        });

        grupo.MapGet("/reavaliacao-pendente", async (HttpContext http, VerificarReavaliacaoPendenteUseCase useCase) =>
        {
            var usuarioId = http.User.ObterUsuarioId();
            var status = await useCase.ExecutarAsync(usuarioId);
            return Results.Ok(status);
        });

        grupo.MapPost("/{id:guid}/fotos", () => Results.Json(new { mensagem = "Novos envios de fotos corporais estão desabilitados. Use apenas avatar." }, statusCode: 410));
    }
}
