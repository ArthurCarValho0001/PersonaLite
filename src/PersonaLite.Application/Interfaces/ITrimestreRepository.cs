using PersonaLite.Domain.Entities;

namespace PersonaLite.Application.Interfaces;

public interface ITrimestreRepository
{
    Task<Trimestre?> ObterVigenteAsync(Guid usuarioId);
    Task<Trimestre?> ObterUltimoAsync(Guid usuarioId);
    Task SalvarAsync(Trimestre trimestre);
    Task SalvarAlteracoesAsync();
}