using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using PersonaLite.Domain.Entities;
using PersonaLite.Infrastructure.Data;
namespace PersonaLite.Api;

// Database locks coordinate commands across API instances. SaveChanges participates
// in this transaction, so the operation and its receipt are committed together.
public class OperacoesMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext h, PersonaLiteDbContext db)
    {
        h.Response.Headers.CacheControl = "no-store";
        if (HttpMethods.IsGet(h.Request.Method) || HttpMethods.IsOptions(h.Request.Method)) { await next(h); return; }
        var autenticado = h.User.Identity?.IsAuthenticated == true;
        var usuario = autenticado ? h.User.ObterUsuarioId() : Guid.Empty;
        var rota = (h.Request.Path.Value ?? "").TrimEnd('/').ToLowerInvariant();
        if (!autenticado && !rota.StartsWith("/api/auth/")) { await next(h); return; }
        await using var tx = await db.Database.BeginTransactionAsync(h.RequestAborted);
        if (rota.StartsWith("/api/aprender/"))
            await db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock_shared(72910402)", h.RequestAborted);
        // Identity updates must serialize normalized username/email checks.
        if (rota.StartsWith("/api/auth/") || rota.StartsWith("/api/usuario"))
            await db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(72910401)", h.RequestAborted);
        if (autenticado) {
            var lockKey = BitConverter.ToInt64(SHA256.HashData(usuario.ToByteArray()), 0);
            await db.Database.ExecuteSqlInterpolatedAsync($"SELECT pg_advisory_xact_lock({lockKey})", h.RequestAborted);
        }
        var chave = h.Request.Headers["Idempotency-Key"].ToString();
        var elegivel = HttpMethods.IsPost(h.Request.Method) && autenticado &&
            (rota == "/api/series" || rota == "/api/medidas" || rota.EndsWith("/tentativas"));
        // Existing clients remain compatible; the V2 client always sends a key.
        var idempotente = elegivel && chave.Length > 0;
        if ((idempotente || rota.EndsWith("/tentativas")) && !Guid.TryParse(chave, out _)) {
            h.Response.StatusCode = 400;
            await h.Response.WriteAsJsonAsync(new { mensagem = "Informe uma Idempotency-Key UUID." }); return;
        }
        string hash = "";
        if (idempotente) {
            h.Request.EnableBuffering(bufferThreshold: 32768, bufferLimit: 1048576);
            using var reader = new StreamReader(h.Request.Body, Encoding.UTF8, leaveOpen: true);
            var corpo = await reader.ReadToEndAsync(h.RequestAborted); h.Request.Body.Position = 0;
            hash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(rota + "\n" + corpo)));
            var anterior = await db.OperacoesProcessadas.SingleOrDefaultAsync(x => x.UsuarioId == usuario && x.Chave == chave, h.RequestAborted);
            if (anterior is not null) {
                if (anterior.Hash != hash) { h.Response.StatusCode = 409; await h.Response.WriteAsJsonAsync(new { mensagem = "Chave já utilizada com outro conteúdo." }); return; }
                h.Response.StatusCode = anterior.Status; h.Response.ContentType = "application/json";
                await h.Response.WriteAsync(anterior.Resposta); return;
            }
        }
        var original = h.Response.Body;
        await using var buffer = new MemoryStream(); h.Response.Body = buffer;
        try {
            await next(h);
            if (h.Response.StatusCode < 400) {
                if (idempotente) {
                    buffer.Position = 0;
                    var resposta = await new StreamReader(buffer, leaveOpen: true).ReadToEndAsync(h.RequestAborted);
                    db.OperacoesProcessadas.Add(new OperacaoProcessada { UsuarioId = usuario, Chave = chave, Rota = rota, Hash = hash, Status = h.Response.StatusCode, Resposta = resposta });
                    await db.SaveChangesAsync(h.RequestAborted);
                }
                await tx.CommitAsync(h.RequestAborted);
            }
            buffer.Position = 0; h.Response.Body = original;
            await buffer.CopyToAsync(original, h.RequestAborted);
        } finally { h.Response.Body = original; }
    }
}
