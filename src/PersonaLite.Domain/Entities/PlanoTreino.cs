namespace PersonaLite.Domain.Entities;

public class PlanoTreino
{
    public Guid Id { get; private set; }
    public Guid UsuarioId { get; private set; }
    public DateOnly InicioVigencia { get; private set; }
    public DateOnly? FimVigencia { get; private set; }
    public List<DiaDeTreino> Dias { get; private set; } = new();

    private PlanoTreino() { }

    public PlanoTreino(Guid usuarioId, DateOnly inicioVigencia)
    {
        Id = Guid.NewGuid();
        UsuarioId = usuarioId;
        InicioVigencia = inicioVigencia;
    }

    public DiaDeTreino AdicionarDia(string nome, DayOfWeek diaSemana)
    {
        var dia = new DiaDeTreino(Id, nome, diaSemana);
        Dias.Add(dia);
        return dia;
    }

    public void Encerrar(DateOnly data) => FimVigencia = data;
}

public class DiaDeTreino
{
    public Guid Id { get; private set; }
    public Guid PlanoTreinoId { get; private set; }
    public string Nome { get; private set; } = string.Empty; // ex: "Peito", "Costas"
    public DayOfWeek DiaSemana { get; private set; }
    public List<ExercicioPlanejado> Exercicios { get; private set; } = new();

    private DiaDeTreino() { }

    public DiaDeTreino(Guid planoTreinoId, string nome, DayOfWeek diaSemana)
    {
        Id = Guid.NewGuid();
        PlanoTreinoId = planoTreinoId;
        Nome = nome;
        DiaSemana = diaSemana;
    }

    public void AdicionarExercicio(ExercicioPlanejado exercicio) => Exercicios.Add(exercicio);
}

public class ExercicioPlanejado
{
    public Guid Id { get; private set; }
    public Guid DiaDeTreinoId { get; private set; }
    public string Nome { get; private set; } = string.Empty;
    public string GrupoMuscular { get; private set; } = string.Empty;
    public int SeriesAlvo { get; private set; }
    public int RepeticoesAlvo { get; private set; }
    public int Ordem { get; private set; }

    private ExercicioPlanejado() { }

    public ExercicioPlanejado(Guid diaDeTreinoId, string nome, string grupoMuscular, int seriesAlvo, int repeticoesAlvo, int ordem)
    {
        Id = Guid.NewGuid();
        DiaDeTreinoId = diaDeTreinoId;
        Nome = nome;
        GrupoMuscular = grupoMuscular;
        SeriesAlvo = seriesAlvo;
        RepeticoesAlvo = repeticoesAlvo;
        Ordem = ordem;
    }
}
