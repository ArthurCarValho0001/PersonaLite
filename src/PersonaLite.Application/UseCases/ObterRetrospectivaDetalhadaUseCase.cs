using PersonaLite.Application.DTOs;
using PersonaLite.Application.Interfaces;
using PersonaLite.Domain.Entities;

namespace PersonaLite.Application.UseCases;

public class ObterRetrospectivaDetalhadaUseCase
{
    private readonly IPlanoTreinoRepository _planoRepo;
    private readonly ISessaoExercicioRepository _sessaoRepo;

    public ObterRetrospectivaDetalhadaUseCase(IPlanoTreinoRepository planoRepo, ISessaoExercicioRepository sessaoRepo)
    {
        _planoRepo = planoRepo;
        _sessaoRepo = sessaoRepo;
    }

    public async Task<RetrospectivaDetalhadaDto?> ExecutarAsync(Guid usuarioId)
    {
        var plano = await _planoRepo.ObterVigenteAsync(usuarioId);
        if (plano is null) return null;

        var hoje = DateOnly.FromDateTime(DateTime.Today);
        var inicioMesAtual = new DateOnly(hoje.Year, hoje.Month, 1);
        var inicioMesAnterior = inicioMesAtual.AddMonths(-1);
        var fimMesAnterior = inicioMesAtual.AddDays(-1);

        var treinos = new List<TreinoRetrospectivaDto>();

        foreach (var dia in plano.Dias.OrderBy(d => (int)d.DiaSemana))
        {
            var exerciciosRetro = new List<ExercicioRetrospectivaDto>();

            foreach (var exercicio in dia.Exercicios.OrderBy(e => e.Ordem))
            {
                var nomeNormalizado = exercicio.Nome.Trim().ToLowerInvariant();

                var sessoesMesAtual = await _sessaoRepo.ListarConcluidasPorNomeNoPeriodoAsync(
                    usuarioId, nomeNormalizado, inicioMesAtual, hoje);

                if (sessoesMesAtual.Sum(s => s.Series.Select(x => x.GrupoSerie).Distinct().Count()) == 0)
                    continue; // sem nenhuma série concluída nesse exercício esse mês — não polui a tela

                var atual = Calcular(sessoesMesAtual);

                var sessoesMesAnterior = await _sessaoRepo.ListarConcluidasPorNomeNoPeriodoAsync(
                    usuarioId, nomeNormalizado, inicioMesAnterior, fimMesAnterior);
                var anterior = sessoesMesAnterior.Count > 0 ? Calcular(sessoesMesAnterior) : null;

                ComparativoMesDto? comparativo = anterior is null ? null : new ComparativoMesDto(
                    VolumeTotalPercentual: anterior.VolumeTotal > 0
                        ? Math.Round((atual.VolumeTotal - anterior.VolumeTotal) / anterior.VolumeTotal * 100, 1)
                        : null,
                    MaiorCargaDiferencaKg: Math.Round(atual.MaiorCarga - anterior.MaiorCarga, 1),
                    MediaCargaDiferencaKg: Math.Round(atual.MediaCarga - anterior.MediaCarga, 1));

                exerciciosRetro.Add(new ExercicioRetrospectivaDto(
                    exercicio.Nome,
                    atual.SeriesRealizadas,
                    Math.Round(atual.VolumeTotal, 1),
                    Math.Round(atual.MaiorCarga, 1),
                    atual.MelhorSerie,
                    Math.Round(atual.MediaCarga, 1),
                    Math.Round(atual.MediaRepeticoes, 1),
                    comparativo));
            }

            if (exerciciosRetro.Count > 0)
                treinos.Add(new TreinoRetrospectivaDto(dia.Nome, exerciciosRetro));
        }

        return new RetrospectivaDetalhadaDto(inicioMesAtual, treinos);
    }

    private record Estatisticas(int SeriesRealizadas, double VolumeTotal, double MaiorCarga, ResumoSerieDto? MelhorSerie, double MediaCarga, double MediaRepeticoes);

    private static Estatisticas Calcular(List<SessaoExercicio> sessoes)
    {
        var grupos = sessoes
            .SelectMany(s => s.Series.GroupBy(x => x.GrupoSerie))
            .Select(g =>
            {
                var estagios = g.OrderBy(e => e.OrdemEstagio).ToList();
                var volume = estagios.Sum(e => e.CargaKg * e.Repeticoes);
                var repsTotais = estagios.Sum(e => e.Repeticoes);
                var principal = estagios.First(e => e.OrdemEstagio == 0);
                var pesoMedio = repsTotais == 0 ? 0 : volume / repsTotais;
                return new { volume, repsTotais, principal.CargaKg, principal.Repeticoes, pesoMedio };
            })
            .ToList();

        if (grupos.Count == 0)
            return new Estatisticas(0, 0, 0, null, 0, 0);

        var melhorGrupo = grupos.OrderByDescending(g => g.volume).First();

        return new Estatisticas(
            SeriesRealizadas: grupos.Count,
            VolumeTotal: grupos.Sum(g => g.volume),
            MaiorCarga: grupos.Max(g => g.CargaKg),
            MelhorSerie: new ResumoSerieDto(melhorGrupo.CargaKg, melhorGrupo.Repeticoes),
            MediaCarga: grupos.Average(g => g.pesoMedio),
            MediaRepeticoes: grupos.Average(g => g.repsTotais));
    }
}