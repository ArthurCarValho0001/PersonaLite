using PersonaLite.Application.Interfaces;

namespace PersonaLite.Api;

// Only registered by the guarded local profile. Never contacts an email provider.
public sealed class LocalEmailService(ILogger<LocalEmailService> logger) : IEmailService
{
    public Task EnviarAsync(string destinatario, string assunto, string corpoHtml)
    {
        logger.LogInformation("E-mail simulado local: {Assunto}. Conteúdo: {Corpo}", assunto, corpoHtml);
        return Task.CompletedTask;
    }
}
