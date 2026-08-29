using PersonaLite.Application.DTOs;
using PersonaLite.Application.Interfaces;

namespace PersonaLite.Application.UseCases;

public class AlterarSenhaUseCase
{
    private readonly IUsuarioRepository _usuarioRepo;
    private readonly IPasswordHasher _hasher;

    public AlterarSenhaUseCase(IUsuarioRepository usuarioRepo, IPasswordHasher hasher)
    {
        _usuarioRepo = usuarioRepo;
        _hasher = hasher;
    }

    public async Task ExecutarAsync(Guid usuarioId, AlterarSenhaDto dto)
    {
        var usuario = await _usuarioRepo.ObterAsync(usuarioId)
            ?? throw new InvalidOperationException("Usuário não encontrado.");

        if (!_hasher.Verificar(dto.SenhaAtual, usuario.SenhaHash))
            throw new InvalidOperationException("Senha atual incorreta.");

        if (dto.NovaSenha.Length < 6)
            throw new InvalidOperationException("A nova senha precisa ter pelo menos 6 caracteres.");

        usuario.AlterarSenha(_hasher.Hash(dto.NovaSenha));
        await _usuarioRepo.AtualizarAsync(usuario);
    }
}