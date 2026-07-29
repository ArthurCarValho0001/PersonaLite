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

    public async Task<UsuarioDto?> ExecutarAsync()
    {
        var usuario = await _usuarioRepo.ObterUnicoAsync();
        if (usuario is null) return null;

        return new UsuarioDto(usuario.Id, usuario.Nome, usuario.Sexo, usuario.DataNascimento, usuario.AlturaCm);
    }
}
