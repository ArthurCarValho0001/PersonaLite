using PersonaLite.Application.DTOs;
using PersonaLite.Application.Interfaces;

namespace PersonaLite.Application.UseCases;

public class AtualizarInformacoesPessoaisUseCase
{
    private readonly IUsuarioRepository _usuarioRepo;

    public AtualizarInformacoesPessoaisUseCase(IUsuarioRepository usuarioRepo)
    {
        _usuarioRepo = usuarioRepo;
    }

    public async Task ExecutarAsync(Guid usuarioId, AtualizarInformacoesPessoaisDto dto)
    {
        var usuario = await _usuarioRepo.ObterAsync(usuarioId)
            ?? throw new InvalidOperationException("Usuário não encontrado.");

        usuario.AtualizarInformacoesPessoais(dto.Nome, dto.DataNascimento, dto.Sexo, dto.Metas);
        await _usuarioRepo.AtualizarAsync(usuario);
    }
}