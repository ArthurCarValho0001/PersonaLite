using PersonaLite.Domain.Entities;

namespace PersonaLite.Application.Interfaces;

public interface IFotoProgressoRepository
{
    Task<List<FotoProgresso>> ListarPorRegistroAsync(Guid registroMedidasId);
    Task SalvarAsync(FotoProgresso foto);
}
