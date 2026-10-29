using PersonaLite.Application.DTOs;
using PersonaLite.Domain.Enums;
namespace PersonaLite.Application.UseCases;
public class ConflitoException(string mensagem) : InvalidOperationException(mensagem);
public static class ValidacaoV2
{
    public static void Perfil(string nome, DateOnly nascimento, Sexo sexo, DateOnly hoje)
    {
        if (string.IsNullOrWhiteSpace(nome) || nome.Trim().Length > 150 || nascimento == default || nascimento > hoje || !Enum.IsDefined(sexo))
            throw new ArgumentException("Informe nome, sexo e nascimento válido, sem data futura.");
    }
    public static void Email(string? email)
    {
        if (string.IsNullOrWhiteSpace(email)) return;
        if (email.Length > 254 || !System.Net.Mail.MailAddress.TryCreate(email.Trim(), out var parsed) || parsed.Address != email.Trim())
            throw new ArgumentException("Informe um e-mail válido.");
    }
    public static void Medidas(CriarRegistroMedidasDto dto, DateOnly hoje)
    {
        if (dto.Data == default || dto.Data > hoje || !double.IsFinite(dto.PesoKg) || dto.PesoKg <= 0)
            throw new ArgumentException("Informe data válida não futura e peso positivo.");
        var valores = new[] { dto.Pescoco, dto.ToraxMesoesternal, dto.ToraxMamilo, dto.UltimaCostela, dto.Cintura, dto.Quadril, dto.BracoEsquerdo, dto.BracoDireito, dto.AntebracoEsquerdo, dto.AntebracoDireito, dto.PernaEsquerda, dto.PernaDireita, dto.PanturrilhaEsquerda, dto.PanturrilhaDireita, dto.Peitoral, dto.AxilarMedia, dto.Triceps, dto.Subescapular, dto.Abdominal, dto.Suprailiaca, dto.CoxaDobra };
        if (valores.Any(x => !double.IsFinite(x) || x <= 0)) throw new ArgumentException("Todas as medidas e dobras devem ser positivas e finitas.");
    }
}
