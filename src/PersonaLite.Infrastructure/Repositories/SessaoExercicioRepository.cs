using PersonaLite.Application.Interfaces;
using PersonaLite.Domain.Entities;
using PersonaLite.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace PersonaLite.Infrastructure.Repositories;

public class SessaoExercicioRepository : ISessaoExercicioRepository
{
    private readonly PersonaLiteDbContext _context;

    public SessaoExercicioRepository(PersonaLiteDbContext context)
    {
        _context = context;
    }

    public Task<List<SessaoExercicio>> ListarPorExercicioAsync(Guid exercicioPlanejadoId) =>
        _context.SessoesExercicio
            .Include(s => s.Series)
            .Where(s => s.ExercicioPlanejadoId == exercicioPlanejadoId)
            .OrderBy(s => s.Data)
            .ToListAsync();

    public Task<SessaoExercicio?> ObterPorExercicioEDataAsync(Guid exercicioPlanejadoId, DateOnly data) =>
        _context.SessoesExercicio
            .Include(s => s.Series)
            .FirstOrDefaultAsync(s => s.ExercicioPlanejadoId == exercicioPlanejadoId && s.Data == data);

    public Task<List<SessaoExercicio>> ListarPorExerciciosEDataAsync(IEnumerable<Guid> exercicioPlanejadoIds, DateOnly data) =>
        _context.SessoesExercicio
            .Include(s => s.Series)
            .Where(s => exercicioPlanejadoIds.Contains(s.ExercicioPlanejadoId) && s.Data == data)
            .ToListAsync();

    public async Task SalvarAsync(SessaoExercicio sessao)
    {
        _context.SessoesExercicio.Add(sessao);
        await _context.SaveChangesAsync();
    }

    public async Task AtualizarAsync(SessaoExercicio sessao)
    {
        await _context.SaveChangesAsync();
    }
}
