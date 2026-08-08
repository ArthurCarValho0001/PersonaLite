using PersonaLite.Application.DTOs;
using PersonaLite.Application.Interfaces;

namespace PersonaLite.Application.UseCases;

public class ObterUsuarioUseCase
{
    private readonly IUsuarioRepository _usuarioRepo;

    public ObterUsuarioUseCase(IUsuarioRepository usuarioRepo)
    {
        _usuarioRepo = usuarioRepo;
    }

    public async Task<UsuarioDto?> ExecutarAsync(Guid usuarioId)
    {
        var usuario = await _usuarioRepo.ObterAsync(usuarioId);
        if (usuario is null) return null;

        return new UsuarioDto(usuario.Id, usuario.Nome, usuario.Sexo, usuario.DataNascimento, usuario.AlturaCm, usuario.TempoDescansoSegundos);
    }
}
