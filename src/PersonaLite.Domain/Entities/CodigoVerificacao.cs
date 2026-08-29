using PersonaLite.Domain.Enums;

namespace PersonaLite.Domain.Entities;

public class CodigoVerificacao
{
    private const int ValidadeMinutos = 15;

    public Guid Id { get; private set; }
    public Guid UsuarioId { get; private set; }
    public string Codigo { get; private set; } = string.Empty;
    public PropositoCodigo Proposito { get; private set; }
    public DateTime CriadoEmUtc { get; private set; }
    public DateTime ExpiraEmUtc { get; private set; }
    public bool Usado { get; private set; }

    private CodigoVerificacao() { }

    public CodigoVerificacao(Guid usuarioId, string codigo, PropositoCodigo proposito)
    {
        Id = Guid.NewGuid();
        UsuarioId = usuarioId;
        Codigo = codigo;
        Proposito = proposito;
        CriadoEmUtc = DateTime.UtcNow;
        ExpiraEmUtc = DateTime.UtcNow.AddMinutes(ValidadeMinutos);
        Usado = false;
    }

    public bool EstaValido() => !Usado && DateTime.UtcNow <= ExpiraEmUtc;

    public void MarcarComoUsado()
    {
        if (!EstaValido())
            throw new InvalidOperationException("Código inválido ou expirado.");
        Usado = true;
    }
}