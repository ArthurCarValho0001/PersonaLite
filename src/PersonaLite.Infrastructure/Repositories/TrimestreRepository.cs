using PersonaLite.Application.Interfaces;
using PersonaLite.Domain.Entities;
using PersonaLite.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace PersonaLite.Infrastructure.Repositories;

public class TrimestreRepository : ITrimestreRepository
{
    private readonly PersonaLiteDbContext _context;

    public TrimestreRepository(PersonaLiteDbContext context)
    {
        _context = context;
    }

    public Task<Trimestre?> ObterVigenteAsync(Guid usuarioId) =>
        _context.Trimestres
            .Where(t => t.UsuarioId == usuarioId && t.DataFim == null)
            .OrderByDescending(t => t.Numero)
            .FirstOrDefaultAsync();

    public Task<Trimestre?> ObterUltimoAsync(Guid usuarioId) =>
        _context.Trimestres
            .Where(t => t.UsuarioId == usuarioId)
            .OrderByDescending(t => t.Numero)
            .FirstOrDefaultAsync();

    public async Task SalvarAsync(Trimestre trimestre)
    {
        _context.Trimestres.Add(trimestre);
        await _context.SaveChangesAsync();
    }

    public async Task SalvarAlteracoesAsync() => await _context.SaveChangesAsync();
}