namespace PersonaLite.Domain.Entities;

public enum AnguloFoto { Frente, Lado, Costas }

public class FotoProgresso
{
    public Guid Id { get; private set; }
    public Guid RegistroMedidasId { get; private set; }
    public AnguloFoto Angulo { get; private set; }
    public string CaminhoArquivo { get; private set; } = string.Empty;

    private FotoProgresso() { }

    public FotoProgresso(Guid registroMedidasId, AnguloFoto angulo, string caminhoArquivo)
    {
        Id = Guid.NewGuid();
        RegistroMedidasId = registroMedidasId;
        Angulo = angulo;
        CaminhoArquivo = caminhoArquivo;
    }
}
