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
/// Um estágio de uma série. GrupoSerie identifica a qual "série física" pertence
/// (várias linhas com o mesmo GrupoSerie = um drop set). OrdemEstagio indica a ordem
/// dentro do drop (0 = carga principal, 1+ = quedas de carga).
/// </summary>
public record SerieRealizada(int GrupoSerie, int OrdemEstagio, double CargaKg, int Repeticoes);
