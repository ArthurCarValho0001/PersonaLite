using PersonaLite.Application.Interfaces;
using PersonaLite.Domain.Entities;
using PersonaLite.Domain.Enums;

namespace PersonaLite.Application.UseCases;

public class SolicitarVerificacaoEmailUseCase
{
    private readonly IUsuarioRepository _usuarioRepo;
    private readonly ICodigoVerificacaoRepository _codigoRepo;
    private readonly IEmailService _emailService;

    public SolicitarVerificacaoEmailUseCase(
        IUsuarioRepository usuarioRepo, ICodigoVerificacaoRepository codigoRepo, IEmailService emailService)
    {
        _usuarioRepo = usuarioRepo;
        _codigoRepo = codigoRepo;
        _emailService = emailService;
    }

    public async Task ExecutarAsync(Guid usuarioId)
    {
        var usuario = await _usuarioRepo.ObterAsync(usuarioId)
            ?? throw new InvalidOperationException("Usuário não encontrado.");

        if (string.IsNullOrWhiteSpace(usuario.Email))
            throw new InvalidOperationException("Cadastre um e-mail antes de verificá-lo.");

        var codigoGerado = GerarCodigo();
        var codigo = new CodigoVerificacao(usuario.Id, codigoGerado, PropositoCodigo.VerificarEmail);
        await _codigoRepo.SalvarAsync(codigo);

        await _emailService.EnviarAsync(
            usuario.Email,
            "Confirme seu e-mail — PersonaLite",
            $"<p>Olá, {usuario.Nome}!</p><p>Seu código de verificação é: <strong>{codigoGerado}</strong></p><p>Ele expira em 15 minutos.</p>");
    }

    private static string GerarCodigo() => Random.Shared.Next(100000, 999999).ToString();
}