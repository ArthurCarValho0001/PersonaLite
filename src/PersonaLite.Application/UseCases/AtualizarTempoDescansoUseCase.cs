using PersonaLite.Application.DTOs;
using PersonaLite.Application.Interfaces;

namespace PersonaLite.Application.UseCases;

public class AtualizarTempoDescansoUseCase
{
    private readonly IUsuarioRepository _usuarioRepo;

    public AtualizarTempoDescansoUseCase(IUsuarioRepository usuarioRepo)
    {
        _usuarioRepo = usuarioRepo;
    }

    public async Task ExecutarAsync(Guid usuarioId, AtualizarTempoDescansoDto dto)
    {
        var usuario = await _usuarioRepo.ObterAsync(usuarioId)
            ?? throw new InvalidOperationException("Usuário não encontrado.");

        usuario.DefinirTempoDescanso(dto.Segundos);
        await _usuarioRepo.AtualizarAsync(usuario);
    }
}