using PersonaLite.Application.DTOs;
using PersonaLite.Application.UseCases;
using PersonaLite.Domain.Enums;

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

        grupo.MapPut("/informacoes-pessoais", async (
            HttpContext http, AtualizarInformacoesPessoaisDto dto, AtualizarInformacoesPessoaisUseCase useCase) =>
        {
            var usuarioId = http.User.ObterUsuarioId();
            await useCase.ExecutarAsync(usuarioId, dto);
            return Results.NoContent();
        });

        grupo.MapPost("/avatar", async (HttpContext http, HttpRequest request, AtualizarAvatarUseCase useCase) =>
        {
            if (!request.HasFormContentType)
                return Results.BadRequest("Envie a imagem como multipart/form-data.");

            var form = await request.ReadFormAsync();
            var arquivo = form.Files["arquivo"];
            if (arquivo is null)
                return Results.BadRequest("Arquivo obrigatório.");

            var usuarioId = http.User.ObterUsuarioId();
            await using var stream = arquivo.OpenReadStream();
            var caminho = await useCase.ExecutarAsync(usuarioId, stream, Path.GetExtension(arquivo.FileName));

            return Results.Ok(new { avatarUrl = caminho });
        });

        grupo.MapPut("/nome-usuario", async (
            HttpContext http, AlterarNomeUsuarioDto dto, AlterarNomeUsuarioUseCase useCase) =>
        {
            var usuarioId = http.User.ObterUsuarioId();
            try
            {
                await useCase.ExecutarAsync(usuarioId, dto);
                return Results.NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(new { mensagem = ex.Message });
            }
        });

        grupo.MapPut("/senha", async (HttpContext http, AlterarSenhaDto dto, AlterarSenhaUseCase useCase) =>
        {
            var usuarioId = http.User.ObterUsuarioId();
            try
            {
                await useCase.ExecutarAsync(usuarioId, dto);
                return Results.NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(new { mensagem = ex.Message });
            }
        });

        grupo.MapPut("/email", async (HttpContext http, AlterarEmailDto dto, AlterarEmailUseCase useCase) =>
        {
            var usuarioId = http.User.ObterUsuarioId();
            try
            {
                await useCase.ExecutarAsync(usuarioId, dto);
                return Results.NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(new { mensagem = ex.Message });
            }
        });

        grupo.MapPost("/email/solicitar-verificacao", async (
            HttpContext http, SolicitarVerificacaoEmailUseCase useCase) =>
        {
            var usuarioId = http.User.ObterUsuarioId();
            await useCase.ExecutarAsync(usuarioId);
            return Results.NoContent();
        });

        grupo.MapPost("/email/confirmar-verificacao", async (
            HttpContext http, ConfirmarVerificacaoEmailDto dto, ConfirmarVerificacaoEmailUseCase useCase) =>
        {
            var usuarioId = http.User.ObterUsuarioId();
            try
            {
                await useCase.ExecutarAsync(usuarioId, dto);
                return Results.NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(new { mensagem = ex.Message });
            }
        });
    }
}