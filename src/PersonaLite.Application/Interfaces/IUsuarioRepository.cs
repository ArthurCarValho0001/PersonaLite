using PersonaLite.Domain.Entities;

namespace PersonaLite.Application.Interfaces;

public interface IUsuarioRepository
{
    Task<Usuario?> ObterAsync(Guid id);
    Task<Usuario?> ObterPorNomeUsuarioAsync(string nomeUsuario);
    Task SalvarAsync(Usuario usuario);
    Task AtualizarAsync(Usuario usuario);
}