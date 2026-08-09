using PersonaLite.Application.DTOs;
using PersonaLite.Application.Interfaces;

namespace PersonaLite.Application.UseCases;

public class AtualizarTelefoneUseCase
{
    private readonly IUsuarioRepository _usuarioRepo;

    public AtualizarTelefoneUseCase(IUsuarioRepository usuarioRepo)
    {
        _usuarioRepo = usuarioRepo;
    }

    public async Task ExecutarAsync(Guid usuarioId, AtualizarTelefoneDto dto)
    {
        var usuario = await _usuarioRepo.ObterAsync(usuarioId)
            ?? throw new InvalidOperationException("Usuário não encontrado.");

        usuario.DefinirTelefone(dto.Telefone);
        await _usuarioRepo.AtualizarAsync(usuario);
    }
}