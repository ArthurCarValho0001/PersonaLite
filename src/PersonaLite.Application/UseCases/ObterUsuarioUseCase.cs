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

                return new UsuarioDto(
            usuario.Id, usuario.Nome, usuario.NomeUsuario, usuario.Sexo, usuario.DataNascimento, usuario.AlturaCm,
            usuario.TempoDescansoSegundos, usuario.Email, usuario.EmailVerificado, usuario.AvatarUrl is null ? null : "/api/usuario/avatar/arquivo?v=" + Uri.EscapeDataString(Path.GetFileName(usuario.AvatarUrl)), usuario.Metas);
    }
}
