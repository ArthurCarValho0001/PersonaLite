using PersonaLite.Application.Interfaces;
using PersonaLite.Domain.Entities;
using PersonaLite.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace PersonaLite.Infrastructure.Repositories;

public class PlanoTreinoRepository : IPlanoTreinoRepository
{
    private readonly PersonaLiteDbContext _context;

    public PlanoTreinoRepository(PersonaLiteDbContext context)
    {
        _context = context;
    }

    public Task<PlanoTreino?> ObterAsync(Guid id) =>
        _context.PlanosTreino
            .Include(p => p.Dias).ThenInclude(d => d.Exercicios)
            .FirstOrDefaultAsync(p => p.Id == id);

    public Task<PlanoTreino?> ObterVigenteAsync(Guid usuarioId) =>
        _context.PlanosTreino
            .Include(p => p.Dias).ThenInclude(d => d.Exercicios)
            .Where(p => p.UsuarioId == usuarioId && p.FimVigencia == null)
            .OrderByDescending(p => p.InicioVigencia)
            .FirstOrDefaultAsync();

    public Task<DiaDeTreino?> ObterDiaDeTreinoAsync(Guid diaDeTreinoId) =>
        _context.DiasDeTreino
            .Include(d => d.Exercicios)
            .FirstOrDefaultAsync(d => d.Id == diaDeTreinoId);

    public Task<ExercicioPlanejado?> ObterExercicioAsync(Guid exercicioPlanejadoId) =>
        _context.ExerciciosPlanejados.FirstOrDefaultAsync(e => e.Id == exercicioPlanejadoId);

    public async Task SalvarAsync(PlanoTreino plano)
    {
        _context.PlanosTreino.Add(plano);
        await _context.SaveChangesAsync();
    }

    public async Task SalvarAlteracoesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
