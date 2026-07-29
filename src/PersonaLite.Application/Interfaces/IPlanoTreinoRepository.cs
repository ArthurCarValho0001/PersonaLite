using PersonaLite.Domain.Entities;

namespace PersonaLite.Application.Interfaces;

public interface IPlanoTreinoRepository
{
    Task<PlanoTreino?> ObterAsync(Guid id);
    Task<PlanoTreino?> ObterVigenteAsync(Guid usuarioId);
    Task<DiaDeTreino?> ObterDiaDeTreinoAsync(Guid diaDeTreinoId);
    Task<ExercicioPlanejado?> ObterExercicioAsync(Guid exercicioPlanejadoId);
    Task SalvarAsync(PlanoTreino plano);

    /// <summary>
    /// Persiste alterações feitas em entidades já rastreadas pelo EF Core
    /// (obtidas via ObterAsync/ObterDiaDeTreinoAsync na mesma requisição).
    /// </summary>
    Task SalvarAlteracoesAsync();
}
