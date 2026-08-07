using PersonaLite.Domain.Entities;

namespace PersonaLite.Application.Interfaces;

/// <summary>Uma sessão concluída, já com o nome do exercício resolvido (usado na retrospectiva).</summary>
public record SessaoConcluidaProjecao(DateOnly Data, string NomeExercicio, List<SerieRealizada> Series);

public interface ISessaoExercicioRepository
{
    Task<List<SessaoExercicio>> ListarPorExercicioAsync(Guid exercicioPlanejadoId);
    Task<SessaoExercicio?> ObterPorExercicioEDataAsync(Guid exercicioPlanejadoId, DateOnly data);
    Task<List<SessaoExercicio>> ListarPorExerciciosEDataAsync(IEnumerable<Guid> exercicioPlanejadoIds, DateOnly data);
    Task<SessaoExercicio?> ObterPorIdAsync(Guid id);
    Task<SessaoExercicio?> ObterUltimaSessaoPorNomeExercicioAsync(Guid usuarioId, string nomeExercicioNormalizado, DateOnly antesDe);
    Task<List<SessaoConcluidaProjecao>> ListarConcluidasNoPeriodoAsync(Guid usuarioId, DateOnly inicio, DateOnly fim);
    Task SalvarAsync(SessaoExercicio sessao);
    Task AtualizarAsync(SessaoExercicio sessao);
}