using PersonaLite.Domain.Entities;

namespace PersonaLite.Application.Interfaces;

public record SessaoConcluidaProjecao(DateOnly Data, string NomeExercicio, List<SerieRealizada> Series);
public record SessaoConcluidaComDiaProjecao(DateOnly Data, Guid DiaDeTreinoId, Guid ExercicioPlanejadoId, string NomeExercicio, List<SerieRealizada> Series);

public interface ISessaoExercicioRepository
{
    Task<Dictionary<Guid, SessaoExercicio>> ObterUltimasSessoesAsync(Guid usuarioId, IEnumerable<Guid> exercicios, DateOnly antesDe);
    Task<List<SessaoExercicio>> ListarPorExercicioAsync(Guid exercicioPlanejadoId);
    Task<SessaoExercicio?> ObterPorExercicioEDataAsync(Guid exercicioPlanejadoId, DateOnly data);
    Task<List<SessaoExercicio>> ListarPorExerciciosEDataAsync(IEnumerable<Guid> exercicioPlanejadoIds, DateOnly data);
    Task<SessaoExercicio?> ObterPorIdAsync(Guid id);
    Task<SessaoExercicio?> ObterUltimaSessaoPorNomeExercicioAsync(Guid usuarioId, string nomeExercicioNormalizado, DateOnly antesDe);
    Task<List<SessaoConcluidaProjecao>> ListarConcluidasNoPeriodoAsync(Guid usuarioId, DateOnly inicio, DateOnly fim);
    Task<List<SessaoExercicio>> ListarConcluidasPorNomeNoPeriodoAsync(Guid usuarioId, string nomeExercicioNormalizado, DateOnly inicio, DateOnly fim);
    Task<List<SessaoConcluidaComDiaProjecao>> ListarConcluidasComDiaNoPeriodoAsync(Guid usuarioId, DateOnly inicio, DateOnly fim);
    Task<(double CargaKg, int Repeticoes)?> ObterRecordeAnteriorAsync(Guid usuarioId, string nomeExercicioNormalizado, DateOnly antesDe);
    Task<Dictionary<Guid, double>> ObterVolumesRecordesAsync(Guid usuarioId, DateOnly antesDe);
    Task<int> ContarTreinosConcluidosTotalAsync(Guid usuarioId);
    Task SalvarAsync(SessaoExercicio sessao);
    Task AtualizarAsync(SessaoExercicio sessao);
}
