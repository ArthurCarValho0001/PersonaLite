using PersonaLite.Application.DTOs;
using PersonaLite.Application.Interfaces;
using PersonaLite.Domain.Entities;
using PersonaLite.Domain.Enums;

namespace PersonaLite.Application.UseCases;

public class SolicitarRedefinicaoSenhaUseCase
{
    private readonly IUsuarioRepository _usuarioRepo;
    private readonly ICodigoVerificacaoRepository _codigoRepo;
    private readonly IEmailService _emailService;

    public SolicitarRedefinicaoSenhaUseCase(
        IUsuarioRepository usuarioRepo, ICodigoVerificacaoRepository codigoRepo, IEmailService emailService)
    {
        _usuarioRepo = usuarioRepo;
        _codigoRepo = codigoRepo;
        _emailService = emailService;
    }

    public async Task ExecutarAsync(SolicitarRedefinicaoSenhaDto dto)
    {
        var usuario = await _usuarioRepo.ObterPorEmailAsync(dto.Email.Trim().ToLowerInvariant());

        // Não revela se o e-mail existe ou não — evita enumeração de contas.
        if (usuario is null || !usuario.EmailVerificado) return;

        var codigoGerado = Random.Shared.Next(100000, 999999).ToString();
        var codigo = new CodigoVerificacao(usuario.Id, codigoGerado, PropositoCodigo.RedefinirSenha);
        await _codigoRepo.SalvarAsync(codigo);

        await _emailService.EnviarAsync(
            usuario.Email!,
            "Redefinição de senha — PersonaLite",
            $"<p>Olá, {usuario.Nome}!</p><p>Seu código para redefinir a senha é: <strong>{codigoGerado}</strong></p><p>Ele expira em 15 minutos. Se você não pediu isso, ignore este e-mail.</p>");
    }
}