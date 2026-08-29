using PersonaLite.Application.DTOs;
using PersonaLite.Application.Interfaces;
using PersonaLite.Domain.Enums;

namespace PersonaLite.Application.UseCases;

public class RedefinirSenhaUseCase
{
    private readonly IUsuarioRepository _usuarioRepo;
    private readonly ICodigoVerificacaoRepository _codigoRepo;
    private readonly IPasswordHasher _hasher;

    public RedefinirSenhaUseCase(IUsuarioRepository usuarioRepo, ICodigoVerificacaoRepository codigoRepo, IPasswordHasher hasher)
    {
        _usuarioRepo = usuarioRepo;
        _codigoRepo = codigoRepo;
        _hasher = hasher;
    }

    public async Task ExecutarAsync(RedefinirSenhaDto dto)
    {
        var usuario = await _usuarioRepo.ObterPorEmailAsync(dto.Email.Trim().ToLowerInvariant())
            ?? throw new InvalidOperationException("Código inválido ou expirado.");

        var codigo = await _codigoRepo.ObterValidoAsync(usuario.Id, dto.Codigo, PropositoCodigo.RedefinirSenha)
            ?? throw new InvalidOperationException("Código inválido ou expirado.");

        if (dto.NovaSenha.Length < 6)
            throw new InvalidOperationException("A nova senha precisa ter pelo menos 6 caracteres.");

        codigo.MarcarComoUsado();
        await _codigoRepo.AtualizarAsync(codigo);

        usuario.AlterarSenha(_hasher.Hash(dto.NovaSenha));
        await _usuarioRepo.AtualizarAsync(usuario);
    }
}