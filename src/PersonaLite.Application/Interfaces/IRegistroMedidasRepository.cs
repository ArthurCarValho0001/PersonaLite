using PersonaLite.Domain.Entities;

namespace PersonaLite.Application.Interfaces;

public interface IRegistroMedidasRepository
{
    Task<RegistroMedidas?> ObterAsync(Guid id);
    Task<List<RegistroMedidas>> ListarPorUsuarioAsync(Guid usuarioId);
    Task<RegistroMedidas?> ObterMaisRecenteAsync(Guid usuarioId);
    Task SalvarAsync(RegistroMedidas registro);
    Task AtualizarAsync(RegistroMedidas registro);
}
