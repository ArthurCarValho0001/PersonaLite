using PersonaLite.Domain.Entities;

namespace PersonaLite.Application.Interfaces;

public interface IUsuarioRepository
{
    Task<Usuario?> ObterAsync(Guid id);
    Task<Usuario?> ObterUnicoAsync(); // app é single-user
    Task SalvarAsync(Usuario usuario);
}
