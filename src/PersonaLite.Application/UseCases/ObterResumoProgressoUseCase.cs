using PersonaLite.Application.DTOs;
using PersonaLite.Application.Interfaces;

namespace PersonaLite.Application.UseCases;

public class ObterResumoProgressoUseCase
{
    private static readonly int[] MarcosTreinos = { 1, 10, 25, 50, 100, 200 };

    private readonly ISessaoExercicioRepository _sessaoRepo;

    public ObterResumoProgressoUseCase(ISessaoExercicioRepository sessaoRepo)
    {
        _sessaoRepo = sessaoRepo;
    }

    public async Task<ResumoProgressoDto> ExecutarAsync(Guid usuarioId)
    {
        var hoje = DateOnly.FromDateTime(DateTime.Today);
        var inicioMesAtual = new DateOnly(hoje.Year, hoje.Month, 1);
        var inicioMesAnterior = inicioMesAtual.AddMonths(-1);
        var fimMesAnterior = inicioMesAtual.AddDays(-1);

        var diaSemanaAtual = (int)hoje.DayOfWeek; // 0=domingo .. 6=sábado
        var deslocamentoSegunda = diaSemanaAtual == 0 ? 6 : diaSemanaAtual - 1;
        var inicioSemana = hoje.AddDays(-deslocamentoSegunda);

        var sessoesMes = await _sessaoRepo.ListarConcluidasComDiaNoPeriodoAsync(usuarioId, inicioMesAtual, hoje);

        var treinos = sessoesMes.Select(s => (s.Data, s.DiaDeTreinoId)).Distinct().Count();
        var volumeTotal = Math.Round(sessoesMes.SelectMany(s => s.Series).Sum(e => e.CargaKg * e.Repeticoes), 0);

        var destaque = await CalcularDestaqueAsync(
            usuarioId, sessoesMes, inicioMesAtual, inicioMesAnterior, fimMesAnterior, inicioSemana, volumeTotal);

        return new ResumoProgressoDto($"{hoje.Year:D4}-{hoje.Month:D2}", treinos, volumeTotal, destaque);
    }

    private async Task<DestaqueProgressoDto?> CalcularDestaqueAsync(
        Guid usuarioId,
        List<Interfaces.SessaoConcluidaComDiaProjecao> sessoesMes,
        DateOnly inicioMesAtual,
        DateOnly inicioMesAnterior,
        DateOnly fimMesAnterior,
        DateOnly inicioSemana,
        double volumeTotalMesAtual)
    {
        if (sessoesMes.Count == 0)
        {
            var totalHistorico = await _sessaoRepo.ContarTreinosConcluidosTotalAsync(usuarioId);
            return totalHistorico == 0
                ? new DestaqueProgressoDto("SEM_HISTORICO", "Comece seu progresso", "Registre seu primeiro treino para acompanhar sua evolução.")
                : null;
        }

        // 1. Novo recorde pessoal — melhor série do mês (por volume) supera o recorde de todos os tempos
        foreach (var grupo in sessoesMes.GroupBy(s => s.NomeExercicio))
        {
            var gruposDeSerie = grupo
                .SelectMany(s => s.Series.GroupBy(x => x.GrupoSerie))
                .Select(g =>
                {
                    var volume = g.Sum(e => e.CargaKg * e.Repeticoes);
                    var principal = g.First(e => e.OrdemEstagio == 0);
                    return new { volume, principal.CargaKg, principal.Repeticoes };
                })
                .ToList();

            if (gruposDeSerie.Count == 0) continue;

            var melhorDoMes = gruposDeSerie.OrderByDescending(g => g.volume).First();
            var nomeNormalizado = grupo.Key.Trim().ToLowerInvariant();
            var recordeAnterior = await _sessaoRepo.ObterRecordeAnteriorAsync(usuarioId, nomeNormalizado, inicioMesAtual);

            if (recordeAnterior is not null)
            {
                var volumeRecordeAnterior = recordeAnterior.Value.CargaKg * recordeAnterior.Value.Repeticoes;
                if (melhorDoMes.volume > volumeRecordeAnterior)
                {
                    return new DestaqueProgressoDto(
                        "NOVO_RECORDE", "Novo recorde!",
                        $"{grupo.Key} • {FormatarPeso(melhorDoMes.CargaKg)}kg × {melhorDoMes.Repeticoes}");
                }
            }
        }

        // 2. Aumento relevante de volume em relação ao mês anterior
        var sessoesMesAnterior = await _sessaoRepo.ListarConcluidasComDiaNoPeriodoAsync(usuarioId, inicioMesAnterior, fimMesAnterior);
        var volumeMesAnterior = sessoesMesAnterior.SelectMany(s => s.Series).Sum(e => e.CargaKg * e.Repeticoes);

        if (volumeMesAnterior > 0)
        {
            var percentual = (volumeTotalMesAtual - volumeMesAnterior) / volumeMesAnterior * 100;
            if (percentual >= 5)
            {
                return new DestaqueProgressoDto("AUMENTO_VOLUME", $"Volume +{percentual:0}%", "em relação ao mês passado");
            }
        }

        // 3. Marco de progresso (contagem histórica total de treinos)
        var totalTreinosHistorico = await _sessaoRepo.ContarTreinosConcluidosTotalAsync(usuarioId);
        if (MarcosTreinos.Contains(totalTreinosHistorico))
        {
            var titulo = totalTreinosHistorico == 1 ? "Primeiro treino registrado!" : $"{totalTreinosHistorico} treinos concluídos!";
            return new DestaqueProgressoDto("MARCO", titulo, "");
        }

        // 4. Consistência de treinos (semana atual, segunda a hoje)
        var sessoesSemana = sessoesMes
            .Where(s => s.Data >= inicioSemana)
            .Select(s => (s.Data, s.DiaDeTreinoId))
            .Distinct()
            .Count();

        if (sessoesSemana >= 3)
        {
            return new DestaqueProgressoDto("CONSISTENCIA", $"{sessoesSemana} treinos esta semana", "Continue mantendo o ritmo!");
        }

        // 5. Maior carga do período
        var maiorCarga = sessoesMes
            .SelectMany(s => s.Series.Where(e => e.OrdemEstagio == 0).Select(e => new { s.NomeExercicio, e.CargaKg }))
            .OrderByDescending(x => x.CargaKg)
            .FirstOrDefault();

        if (maiorCarga is not null)
        {
            return new DestaqueProgressoDto(
                "MAIOR_CARGA", "Maior carga do mês",
                $"{maiorCarga.NomeExercicio} • {FormatarPeso(maiorCarga.CargaKg)}kg");
        }

        return null;
    }

    private static string FormatarPeso(double peso) => peso % 1 == 0 ? peso.ToString("0") : peso.ToString("0.#");
}