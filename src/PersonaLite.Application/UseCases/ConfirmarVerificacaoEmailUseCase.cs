using PersonaLite.Application.DTOs;
using PersonaLite.Application.Interfaces;
using PersonaLite.Domain.Enums;

namespace PersonaLite.Application.UseCases;

public class ConfirmarVerificacaoEmailUseCase
{
    private readonly IUsuarioRepository _usuarioRepo;
    private readonly ICodigoVerificacaoRepository _codigoRepo;

    public ConfirmarVerificacaoEmailUseCase(IUsuarioRepository usuarioRepo, ICodigoVerificacaoRepository codigoRepo)
    {
        _usuarioRepo = usuarioRepo;
        _codigoRepo = codigoRepo;
    }

    public async Task ExecutarAsync(Guid usuarioId, ConfirmarVerificacaoEmailDto dto)
    {
        var codigo = await _codigoRepo.ObterValidoAsync(usuarioId, dto.Codigo, PropositoCodigo.VerificarEmail)
            ?? throw new InvalidOperationException("Código inválido ou expirado.");

        var usuario = await _usuarioRepo.ObterAsync(usuarioId)
            ?? throw new InvalidOperationException("Usuário não encontrado.");

        codigo.MarcarComoUsado();
        await _codigoRepo.AtualizarAsync(codigo);

        usuario.MarcarEmailComoVerificado();
        await _usuarioRepo.AtualizarAsync(usuario);
    }
}