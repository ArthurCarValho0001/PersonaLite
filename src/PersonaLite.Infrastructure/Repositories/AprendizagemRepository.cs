using Microsoft.EntityFrameworkCore;
using PersonaLite.Application.Interfaces;
using PersonaLite.Domain.Entities;
using PersonaLite.Infrastructure.Data;
namespace PersonaLite.Infrastructure.Repositories;

public class AprendizagemRepository(PersonaLiteDbContext db) : IAprendizagemRepository
{
    public Task<List<ModuloVersao>> ModulosAsync() => db.ModulosVersoes.AsNoTracking().ToListAsync();
    public Task<List<AulaEstudada>> AulasAsync(Guid usuarioId) => db.AulasEstudadas.AsNoTracking().Where(a => a.UsuarioId == usuarioId).ToListAsync();
    public Task<List<TentativaEducativa>> TentativasAsync(Guid usuarioId) => db.TentativasEducativas.AsNoTracking().Where(t => t.UsuarioId == usuarioId).ToListAsync();
    public async Task SalvarAulaAsync(AulaEstudada aula) { db.AulasEstudadas.Add(aula); await db.SaveChangesAsync(); }
    public async Task SalvarTentativaAsync(TentativaEducativa tentativa) { db.TentativasEducativas.Add(tentativa); await db.SaveChangesAsync(); }
}
