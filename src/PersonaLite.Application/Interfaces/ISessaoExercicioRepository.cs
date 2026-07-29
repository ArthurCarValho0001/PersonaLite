using PersonaLite.Domain.Entities;

namespace PersonaLite.Application.Interfaces;

public interface ISessaoExercicioRepository
{
    Task<List<SessaoExercicio>> ListarPorExercicioAsync(Guid exercicioPlanejadoId);
    Task<SessaoExercicio?> ObterPorExercicioEDataAsync(Guid exercicioPlanejadoId, DateOnly data);
    Task<List<SessaoExercicio>> ListarPorExerciciosEDataAsync(IEnumerable<Guid> exercicioPlanejadoIds, DateOnly data);
    Task SalvarAsync(SessaoExercicio sessao);
    Task AtualizarAsync(SessaoExercicio sessao);
}
