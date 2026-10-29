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

    public async Task<Dictionary<Guid, SessaoExercicio>> ObterUltimasSessoesAsync(Guid usuarioId, IEnumerable<Guid> exercicios, DateOnly antesDe)
    {
        var ids = exercicios.ToArray();
        var ultimas = await (from e in _context.ExerciciosPlanejados
            join d in _context.DiasDeTreino on e.DiaDeTreinoId equals d.Id
            join p in _context.PlanosTreino on d.PlanoTreinoId equals p.Id
            where p.UsuarioId == usuarioId && ids.Contains(e.Id)
            select _context.SessoesExercicio.Where(s => s.ExercicioPlanejadoId == e.Id && s.Concluida && s.Data < antesDe)
                .OrderByDescending(s => s.Data).ThenByDescending(s => s.Id).Select(s => s.Id).FirstOrDefault()).ToListAsync();
        return await _context.SessoesExercicio.AsNoTracking().Include(s => s.Series).Where(s => ultimas.Contains(s.Id)).ToDictionaryAsync(s => s.ExercicioPlanejadoId);
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

    public async Task<List<SessaoExercicio>> ListarConcluidasPorNomeNoPeriodoAsync(
        Guid usuarioId, string nomeExercicioNormalizado, DateOnly inicio, DateOnly fim)
    {
        var idsExercicios = await (
            from ex in _context.ExerciciosPlanejados
            join d in _context.DiasDeTreino on ex.DiaDeTreinoId equals d.Id
            join p in _context.PlanosTreino on d.PlanoTreinoId equals p.Id
            where p.UsuarioId == usuarioId && ex.Nome.ToLower() == nomeExercicioNormalizado
            select ex.Id
        ).ToListAsync();

        if (idsExercicios.Count == 0) return new List<SessaoExercicio>();

        return await _context.SessoesExercicio
            .Include(s => s.Series)
            .Where(s => s.Concluida && s.Data >= inicio && s.Data <= fim && idsExercicios.Contains(s.ExercicioPlanejadoId))
            .ToListAsync();
    }

    public async Task<List<SessaoConcluidaComDiaProjecao>> ListarConcluidasComDiaNoPeriodoAsync(Guid usuarioId, DateOnly inicio, DateOnly fim)
    {
        var exercicios = await (
            from ex in _context.ExerciciosPlanejados
            join d in _context.DiasDeTreino on ex.DiaDeTreinoId equals d.Id
            join p in _context.PlanosTreino on d.PlanoTreinoId equals p.Id
            where p.UsuarioId == usuarioId
            select new { ex.Id, ex.Nome, DiaDeTreinoId = d.Id }
        ).ToListAsync();

        var infoPorId = exercicios.ToDictionary(x => x.Id, x => x);
        var ids = exercicios.Select(x => x.Id).ToList();
        if (ids.Count == 0) return new List<SessaoConcluidaComDiaProjecao>();

        var sessoes = await _context.SessoesExercicio
            .Include(s => s.Series)
            .Where(s => s.Concluida && s.Data >= inicio && s.Data <= fim && ids.Contains(s.ExercicioPlanejadoId))
            .ToListAsync();

        return sessoes
            .Select(s => new SessaoConcluidaComDiaProjecao(
                s.Data, infoPorId[s.ExercicioPlanejadoId].DiaDeTreinoId, s.ExercicioPlanejadoId, infoPorId[s.ExercicioPlanejadoId].Nome, s.Series.ToList()))
            .ToList();
    }

    public async Task<(double CargaKg, int Repeticoes)?> ObterRecordeAnteriorAsync(Guid usuarioId, string nomeExercicioNormalizado, DateOnly antesDe)
    {
        var idsExercicios = await (
            from ex in _context.ExerciciosPlanejados
            join d in _context.DiasDeTreino on ex.DiaDeTreinoId equals d.Id
            join p in _context.PlanosTreino on d.PlanoTreinoId equals p.Id
            where p.UsuarioId == usuarioId && ex.Nome.ToLower() == nomeExercicioNormalizado
            select ex.Id
        ).ToListAsync();

        if (idsExercicios.Count == 0) return null;

        var sessoes = await _context.SessoesExercicio
            .Include(s => s.Series)
            .Where(s => s.Concluida && s.Data < antesDe && idsExercicios.Contains(s.ExercicioPlanejadoId))
            .ToListAsync();

        var grupos = sessoes
            .SelectMany(s => s.Series.GroupBy(x => x.GrupoSerie))
            .Select(g =>
            {
                var volume = g.Sum(e => e.CargaKg * e.Repeticoes);
                var principal = g.First(e => e.OrdemEstagio == 0);
                return new { volume, principal.CargaKg, principal.Repeticoes };
            })
            .ToList();

        if (grupos.Count == 0) return null;

        var melhor = grupos.OrderByDescending(g => g.volume).First();
        return (melhor.CargaKg, melhor.Repeticoes);
    }

    public async Task<Dictionary<Guid, double>> ObterVolumesRecordesAsync(Guid usuarioId, DateOnly antesDe)
    {
        var volumes = from sessao in _context.SessoesExercicio
            from serie in sessao.Series
            join ex in _context.ExerciciosPlanejados on sessao.ExercicioPlanejadoId equals ex.Id
            join dia in _context.DiasDeTreino on ex.DiaDeTreinoId equals dia.Id
            join plano in _context.PlanosTreino on dia.PlanoTreinoId equals plano.Id
            where plano.UsuarioId == usuarioId && sessao.Concluida && sessao.Data < antesDe
            group serie by new { ExercicioId = ex.Id, SessaoId = sessao.Id, serie.GrupoSerie } into g
            select new { g.Key.ExercicioId, Volume = g.Sum(s => s.CargaKg * s.Repeticoes) };
        return await volumes.GroupBy(v => v.ExercicioId)
            .Select(g => new { Id = g.Key, Volume = g.Max(v => v.Volume) }).ToDictionaryAsync(v => v.Id, v => v.Volume);
    }

    public Task<int> ContarTreinosConcluidosTotalAsync(Guid usuarioId) =>
        (from sessao in _context.SessoesExercicio
         join ex in _context.ExerciciosPlanejados on sessao.ExercicioPlanejadoId equals ex.Id
         join dia in _context.DiasDeTreino on ex.DiaDeTreinoId equals dia.Id
         join plano in _context.PlanosTreino on dia.PlanoTreinoId equals plano.Id
         where plano.UsuarioId == usuarioId && sessao.Concluida
         select new { sessao.Data, DiaId = dia.Id }).Distinct().CountAsync();
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
