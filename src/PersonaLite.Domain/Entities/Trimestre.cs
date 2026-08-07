namespace PersonaLite.Domain.Entities;

public class Trimestre
{
    public Guid Id { get; private set; }
    public Guid UsuarioId { get; private set; }
    public int Numero { get; private set; }
    public DateOnly DataInicio { get; private set; }
    public DateOnly? DataFim { get; private set; }

    private Trimestre() { }

    public Trimestre(Guid usuarioId, int numero, DateOnly dataInicio)
    {
        Id = Guid.NewGuid();
        UsuarioId = usuarioId;
        Numero = numero;
        DataInicio = dataInicio;
    }

    public void Encerrar(DateOnly data) => DataFim = data;

    public DateOnly DataFimPrevista => DataInicio.AddMonths(3);
}