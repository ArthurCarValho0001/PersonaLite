using PersonaLite.Domain.Entities;
namespace PersonaLite.Application.Interfaces;

public interface IAprendizagemRepository
{
    Task<List<ModuloVersao>> ModulosAsync();
    Task<List<AulaEstudada>> AulasAsync(Guid usuarioId);
    Task<List<TentativaEducativa>> TentativasAsync(Guid usuarioId);
    Task SalvarAulaAsync(AulaEstudada aula);
    Task SalvarTentativaAsync(TentativaEducativa tentativa);
}
