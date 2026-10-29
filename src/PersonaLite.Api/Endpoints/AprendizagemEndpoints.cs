using PersonaLite.Application.UseCases;
namespace PersonaLite.Api.Endpoints;

public static class AprendizagemEndpoints
{
    public static void MapAprendizagemEndpoints(this WebApplication app)
    {
        var g = app.MapGroup("/api/aprender").RequireAuthorization().WithTags("Aprender");
        g.MapGet("/modulos", async (HttpContext h, AprendizagemService s) => Results.Ok(await s.CatalogoAsync(h.User.ObterUsuarioId())));
        g.MapGet("/historico", async (HttpContext h, AprendizagemService s) => Results.Ok(await s.HistoricoAsync(h.User.ObterUsuarioId())));
        g.MapGet("/modulos/{id:guid}", async (HttpContext h, Guid id, AprendizagemService s) => Results.Ok(await s.DetalheAsync(h.User.ObterUsuarioId(), id)));
        g.MapPost("/modulos/{id:guid}/aulas/{aulaId}/estudar", async (HttpContext h, Guid id, string aulaId, AprendizagemService s) => {
            await s.MarcarAulaAsync(h.User.ObterUsuarioId(), id, aulaId); return Results.NoContent(); });
        g.MapGet("/modulos/{id:guid}/questionario", async (HttpContext h, Guid id, AprendizagemService s) => Results.Ok(await s.QuestionarioAsync(h.User.ObterUsuarioId(), id)));
        g.MapPost("/modulos/{id:guid}/tentativas", async (HttpContext h, Guid id, EnvioAvaliacao dto, AprendizagemService s) =>
            Results.Ok(await s.EnviarAsync(h.User.ObterUsuarioId(), id, dto.Respostas)));
        g.MapGet("/tentativas/{id:guid}", async (HttpContext h, Guid id, AprendizagemService s) => Results.Ok(await s.ResultadoAsync(h.User.ObterUsuarioId(), id)));
    }
    public record EnvioAvaliacao(Dictionary<string, string> Respostas);
}
