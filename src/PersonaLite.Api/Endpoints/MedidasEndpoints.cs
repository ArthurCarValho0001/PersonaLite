using PersonaLite.Application.DTOs;
using PersonaLite.Application.UseCases;
using PersonaLite.Domain.Entities;

namespace PersonaLite.Api.Endpoints;

public static class MedidasEndpoints
{
    public static void MapMedidasEndpoints(this WebApplication app)
    {
        var grupo = app.MapGroup("/api/medidas").WithTags("Medidas");

        grupo.MapPost("/", async (CriarRegistroMedidasDto dto, RegistrarMedidasUseCase useCase) =>
        {
            var id = await useCase.ExecutarAsync(dto);
            return Results.Created($"/api/medidas/{id}", new { id });
        });

        grupo.MapGet("/{id:guid}", async (Guid id, ObterMedidaUseCase useCase) =>
        {
            var registro = await useCase.ExecutarAsync(id);
            return registro is not null ? Results.Ok(registro) : Results.NotFound();
        });

        grupo.MapPut("/{id:guid}", async (Guid id, CriarRegistroMedidasDto dto, AtualizarMedidasUseCase useCase) =>
        {
            await useCase.ExecutarAsync(id, dto);
            return Results.NoContent();
        });

        grupo.MapGet("/", async (ObterEvolucaoUseCase useCase) =>
        {
            var evolucao = await useCase.ExecutarAsync();
            return Results.Ok(evolucao);
        });

        grupo.MapGet("/reavaliacao-pendente", async (VerificarReavaliacaoPendenteUseCase useCase) =>
        {
            var status = await useCase.ExecutarAsync();
            return Results.Ok(status);
        });

        grupo.MapPost("/{id:guid}/fotos", async (
            Guid id, HttpRequest request, AdicionarFotoProgressoUseCase useCase) =>
        {
            if (!request.HasFormContentType)
                return Results.BadRequest("Envie a foto como multipart/form-data.");

            var form = await request.ReadFormAsync();
            var arquivo = form.Files["arquivo"];
            var anguloTexto = form["angulo"].ToString();

            if (arquivo is null || !Enum.TryParse<AnguloFoto>(anguloTexto, ignoreCase: true, out var angulo))
                return Results.BadRequest("Arquivo e ângulo (Frente/Lado/Costas) são obrigatórios.");

            await using var stream = arquivo.OpenReadStream();
            var dto = new AdicionarFotoProgressoDto(id, angulo, stream, Path.GetExtension(arquivo.FileName));
            var fotoId = await useCase.ExecutarAsync(dto);

            return Results.Created($"/api/fotos/{fotoId}", new { id = fotoId });
        });
    }
}
