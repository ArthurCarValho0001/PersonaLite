namespace PersonaLite.Domain.Entities;

public class SessaoExercicio
{
    public Guid Id { get; private set; }
    public Guid ExercicioPlanejadoId { get; private set; }
    public DateOnly Data { get; private set; }
    public bool Concluida { get; private set; }
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

    /// <summary>
    /// Marca a sessão do dia como concluída. Só séries de sessões concluídas contam
    /// pro histórico "última vez" e pra retrospectiva mensal/trimestral — assim um treino
    /// abandonado no meio (ex: planejou 4 séries, fez só 3 e não voltou mais naquele dia)
    /// não polui as estatísticas até a pessoa confirmar que aquilo foi o treino de verdade.
    /// </summary>
    public void Concluir() => Concluida = true;

    public double CargaMaxima() => Series.Count == 0 ? 0 : Series.Max(s => s.CargaKg);
}

/// <summary>
/// Um estágio de uma série. GrupoSerie identifica a qual "série física" pertence
/// (várias linhas com o mesmo GrupoSerie = um drop set). OrdemEstagio indica a ordem
/// dentro do drop (0 = carga principal, 1+ = quedas de carga).
/// </summary>
public class SerieRealizada
{
    public Guid Id { get; private set; }
    public int GrupoSerie { get; private set; }
    public int OrdemEstagio { get; private set; }
    public double CargaKg { get; private set; }
    public int Repeticoes { get; private set; }

    private SerieRealizada() { }

    public SerieRealizada(int grupoSerie, int ordemEstagio, double cargaKg, int repeticoes)
    {
        Id = Guid.NewGuid();
        GrupoSerie = grupoSerie;
        OrdemEstagio = ordemEstagio;
        CargaKg = cargaKg;
        Repeticoes = repeticoes;
    }
}