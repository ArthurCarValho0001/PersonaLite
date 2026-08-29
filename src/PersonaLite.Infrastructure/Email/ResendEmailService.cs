using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.Extensions.Configuration;
using PersonaLite.Application.Interfaces;

namespace PersonaLite.Infrastructure.Email;

public class ResendEmailService : IEmailService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    public ResendEmailService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _configuration = configuration;
    }

    public async Task EnviarAsync(string destinatario, string assunto, string corpoHtml)
    {
        var apiKey = _configuration["Resend:ApiKey"]
            ?? throw new InvalidOperationException("Resend:ApiKey não configurada.");

        // "onboarding@resend.dev" funciona sem precisar verificar um domínio próprio no Resend —
        // ideal pra começar. Se registrar seu próprio domínio depois, troca via Resend:FromEmail.
        var remetente = _configuration["Resend:FromEmail"] ?? "PersonaLite <onboarding@resend.dev>";

        _httpClient.BaseAddress ??= new Uri("https://api.resend.com/");
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

        var resposta = await _httpClient.PostAsJsonAsync("emails", new
        {
            from = remetente,
            to = new[] { destinatario },
            subject = assunto,
            html = corpoHtml,
        });

        if (!resposta.IsSuccessStatusCode)
        {
            var erro = await resposta.Content.ReadAsStringAsync();
            throw new InvalidOperationException($"Falha ao enviar e-mail via Resend: {erro}");
        }
    }
}
