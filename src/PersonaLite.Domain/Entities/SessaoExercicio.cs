namespace PersonaLite.Domain.Entities;

public class SessaoExercicio
{
    public Guid Id { get; private set; }
    public Guid ExercicioPlanejadoId { get; private set; }
    public DateOnly Data { get; private set; }
    public List<SerieRealizada> Series { get; private set; } = new();

    private SessaoExercicio() { }

    public SessaoExercicio(Guid exercicioPlanejadoId, DateOnly data)
    {
        Id = Guid.NewGuid();
        ExercicioPlanejadoId = exercicioPlanejadoId;
        Data = data;
    }

    /// <summary>
    /// Registra uma série (um "grupo"). Se vier apenas um estágio, é uma série normal.
    /// Se vier mais de um estágio, é um drop set (ex: 40kg 12rep + 35kg 5rep na sequência).
    /// </summary>
    public void RegistrarSerie(IEnumerable<(double CargaKg, int Repeticoes)> estagios)
    {
        var proximoGrupo = Series.Count == 0 ? 1 : Series.Max(s => s.GrupoSerie) + 1;
        var ordem = 0;
        foreach (var (cargaKg, repeticoes) in estagios)
        {
            Series.Add(new SerieRealizada(proximoGrupo, ordem, cargaKg, repeticoes));
            ordem++;
        }
    }

    public double CargaMaxima() => Series.Count == 0 ? 0 : Series.Max(s => s.CargaKg);
}

/// <summary>
    /// Substitui os estágios de uma série já registrada (o "GrupoSerie" continua o mesmo,
    /// só troca peso/repetições — inclusive virando ou deixando de ser drop set).
    /// </summary>
    public void AtualizarSerie(int grupoSerie, IEnumerable<(double CargaKg, int Repeticoes)> estagios)
    {
        if (!Series.Any(s => s.GrupoSerie == grupoSerie))
            throw new InvalidOperationException("Série não encontrada nessa sessão.");

        Series.RemoveAll(s => s.GrupoSerie == grupoSerie);

        var ordem = 0;
        foreach (var (cargaKg, repeticoes) in estagios)
        {
            Series.Add(new SerieRealizada(grupoSerie, ordem, cargaKg, repeticoes));
            ordem++;
        }
    }

    public void RemoverSerie(int grupoSerie)
    {
        var removidos = Series.RemoveAll(s => s.GrupoSerie == grupoSerie);
        if (removidos == 0)
            throw new InvalidOperationException("Série não encontrada nessa sessão.");
    }