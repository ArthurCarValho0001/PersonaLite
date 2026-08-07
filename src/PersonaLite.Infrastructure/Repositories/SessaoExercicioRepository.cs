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

    public Task<SessaoExercicio?> ObterPorIdAsync(Guid id) =>
        _context.SessoesExercicio
            .Include(s => s.Series)
            .FirstOrDefaultAsync(s => s.Id == id);

    public Task<SessaoExercicio?> ObterUltimaSessaoPorNomeExercicioAsync(Guid usuarioId, string nomeExercicioNormalizado, DateOnly antesDe)
    {
        return _context.SessoesExercicio
            .Include(s => s.Series)
            .Where(s => s.Concluida && s.Data < antesDe)
            .Where(s => _context.ExerciciosPlanejados
                .Where(ex => ex.Id == s.ExercicioPlanejadoId && ex.Nome.ToLower() == nomeExercicioNormalizado)
                .Join(_context.DiasDeTreino, ex => ex.DiaDeTreinoId, d => d.Id, (ex, d) => d)
                .Join(_context.PlanosTreino, d => d.PlanoTreinoId, p => p.Id, (d, p) => p)
                .Any(p => p.UsuarioId == usuarioId))
            .OrderByDescending(s => s.Data)
            .FirstOrDefaultAsync();
    }

    public async Task<List<SessaoConcluidaProjecao>> ListarConcluidasNoPeriodoAsync(Guid usuarioId, DateOnly inicio, DateOnly fim)
    {
        var exerciciosDoUsuario = await (
            from ex in _context.ExerciciosPlanejados
            join d in _context.DiasDeTreino on ex.DiaDeTreinoId equals d.Id
            join p in _context.PlanosTreino on d.PlanoTreinoId equals p.Id
            where p.UsuarioId == usuarioId
            select new { ex.Id, ex.Nome }
        ).ToListAsync();

        var nomesPorId = exerciciosDoUsuario.ToDictionary(x => x.Id, x => x.Nome);
        var ids = exerciciosDoUsuario.Select(x => x.Id).ToList();

        var sessoes = await _context.SessoesExercicio
            .Include(s => s.Series)
            .Where(s => s.Concluida && s.Data >= inicio && s.Data <= fim && ids.Contains(s.ExercicioPlanejadoId))
            .ToListAsync();

        return sessoes
            .Select(s => new SessaoConcluidaProjecao(s.Data, nomesPorId[s.ExercicioPlanejadoId], s.Series.ToList()))
            .ToList();
    }

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