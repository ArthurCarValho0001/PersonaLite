using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using PersonaLite.Domain.Entities;
namespace PersonaLite.Infrastructure.Data;

// Offline administration only. Published content is immutable; new text requires
// a new version. Withdrawal preserves all study records and attempts.
public static class CatalogoLocal
{
    public static async Task ImportarAsync(PersonaLiteDbContext db, string arquivo)
    {
        var modulo = JsonSerializer.Deserialize<ModuloVersao>(await File.ReadAllTextAsync(arquivo), new JsonSerializerOptions { PropertyNameCaseInsensitive = true })
            ?? throw new InvalidOperationException("Pacote educativo ausente.");
        modulo.Validar();
        if (!modulo.Demonstracao || modulo.Retirada || modulo.Id == Guid.Empty)
            throw new InvalidOperationException("O processo local aceita somente novas versões de demonstração com ID definido.");
        await using var tx = await db.Database.BeginTransactionAsync();
        await db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(72910402)");
        if (await db.ModulosVersoes.AnyAsync(m => m.Id == modulo.Id || m.ModuloId == modulo.ModuloId && m.Versao == modulo.Versao))
            throw new InvalidOperationException("Uma versão publicada é imutável. Use novo ID e número de versão.");
        var ultima = await db.ModulosVersoes.Where(m => m.ModuloId == modulo.ModuloId).Select(m => (int?)m.Versao).MaxAsync();
        if (ultima.HasValue && modulo.Versao <= ultima) throw new InvalidOperationException("A versão deve ser superior à última publicada.");
        modulo.PublicadoEm = DateTime.UtcNow;
        db.ModulosVersoes.Add(modulo);
        await db.SaveChangesAsync(); await tx.CommitAsync();
    }
    public static async Task RetirarAsync(PersonaLiteDbContext db, Guid id)
    {
        await using var tx = await db.Database.BeginTransactionAsync();
        await db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(72910402)");
        var modulo = await db.ModulosVersoes.SingleOrDefaultAsync(m => m.Id == id)
            ?? throw new InvalidOperationException("Versão não encontrada.");
        modulo.Retirada = true;
        await db.SaveChangesAsync(); await tx.CommitAsync();
    }
}
