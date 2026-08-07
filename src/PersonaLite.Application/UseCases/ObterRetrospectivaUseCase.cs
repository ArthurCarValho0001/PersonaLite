using PersonaLite.Application.DTOs;
using PersonaLite.Application.Interfaces;

namespace PersonaLite.Application.UseCases;

public class ObterRetrospectivaUseCase
{
    private readonly ITrimestreRepository _trimestreRepo;
    private readonly ISessaoExercicioRepository _sessaoRepo;

    public ObterRetrospectivaUseCase(ITrimestreRepository trimestreRepo, ISessaoExercicioRepository sessaoRepo)
    {
        _trimestreRepo = trimestreRepo;
        _sessaoRepo = sessaoRepo;
    }

    public async Task<RetrospectivaTrimestreDto?> ExecutarAsync(Guid usuarioId)
    {
        var trimestre = await _trimestreRepo.ObterVigenteAsync(usuarioId);
        if (trimestre is null) return null;

        var hoje = DateOnly.FromDateTime(DateTime.Today);
        var fimConsulta = hoje < trimestre.DataFimPrevista ? hoje : trimestre.DataFimPrevista.AddDays(-1);

        var sessoes = await _sessaoRepo.ListarConcluidasNoPeriodoAsync(usuarioId, trimestre.DataInicio, fimConsulta);

        var meses = new List<RetrospectivaMesDto>();
        for (var i = 0; i < 3; i++)
        {
            var inicioMes = trimestre.DataInicio.AddMonths(i);
            var fimMes = trimestre.DataInicio.AddMonths(i + 1);

            if (inicioMes > hoje) break; // esse mês do trimestre ainda não começou

            // Considera só o estágio principal de cada série (ignora quedas de drop set),
            // pra não puxar a média de carga pra baixo artificialmente.
            var todasSeries = sessoes
                .Where(s => s.Data >= inicioMes && s.Data < fimMes)
                .SelectMany(s => s.Series.Where(e => e.OrdemEstagio == 0))
                .ToList();

            var totalSeries = todasSeries.Count;
            var mediaReps = totalSeries == 0 ? 0 : todasSeries.Average(e => e.Repeticoes);
            var mediaCarga = totalSeries == 0 ? 0 : todasSeries.Average(e => e.CargaKg);

            meses.Add(new RetrospectivaMesDto(i + 1, inicioMes, totalSeries, Math.Round(mediaReps, 1), Math.Round(mediaCarga, 1)));
        }

        return new RetrospectivaTrimestreDto(trimestre.Numero, trimestre.DataInicio, meses);
    }
}