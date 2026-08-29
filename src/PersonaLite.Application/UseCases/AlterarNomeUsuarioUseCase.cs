using PersonaLite.Application.DTOs;
using PersonaLite.Application.Interfaces;

namespace PersonaLite.Application.UseCases;

public class AlterarNomeUsuarioUseCase
{
    private readonly IUsuarioRepository _usuarioRepo;
    private readonly IPasswordHasher _hasher;

    public AlterarNomeUsuarioUseCase(IUsuarioRepository usuarioRepo, IPasswordHasher hasher)
    {
        _usuarioRepo = usuarioRepo;
        _hasher = hasher;
    }

    public async Task ExecutarAsync(Guid usuarioId, AlterarNomeUsuarioDto dto)
    {
        var usuario = await _usuarioRepo.ObterAsync(usuarioId)
            ?? throw new InvalidOperationException("Usuário não encontrado.");

        if (!_hasher.Verificar(dto.SenhaAtual, usuario.SenhaHash))
            throw new InvalidOperationException("Senha atual incorreta.");

        var novoNormalizado = dto.NovoNomeUsuario.Trim().ToLowerInvariant();
        var existente = await _usuarioRepo.ObterPorNomeUsuarioAsync(novoNormalizado);
        if (existente is not null && existente.Id != usuarioId)
            throw new InvalidOperationException("Esse nome de usuário já está em uso.");

        usuario.AlterarNomeUsuario(novoNormalizado);
        await _usuarioRepo.AtualizarAsync(usuario);
    }
}