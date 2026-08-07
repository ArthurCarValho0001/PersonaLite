using PersonaLite.Application.DTOs;
using PersonaLite.Application.Interfaces;

namespace PersonaLite.Application.UseCases;

public class ObterSugestaoTrocaTreinoUseCase
{
    private readonly ITrimestreRepository _trimestreRepo;
    private readonly ISessaoExercicioRepository _sessaoRepo;

    public ObterSugestaoTrocaTreinoUseCase(ITrimestreRepository trimestreRepo, ISessaoExercicioRepository sessaoRepo)
    {
        _trimestreRepo = trimestreRepo;
        _sessaoRepo = sessaoRepo;
    }

    public async Task<SugestaoTrocaTreinoDto> ExecutarAsync(Guid usuarioId)
    {
        var trimestre = await _trimestreRepo.ObterVigenteAsync(usuarioId);
        if (trimestre is null)
            return new SugestaoTrocaTreinoDto(false, new List<SugestaoExercicioDto>());

        var hoje = DateOnly.FromDateTime(DateTime.Today);
        var trocaPendente = hoje >= trimestre.DataFimPrevista;
        if (!trocaPendente)
            return new SugestaoTrocaTreinoDto(false, new List<SugestaoExercicioDto>());

        var fimConsulta = trimestre.DataFimPrevista.AddDays(-1);
        var sessoes = await _sessaoRepo.ListarConcluidasNoPeriodoAsync(usuarioId, trimestre.DataInicio, fimConsulta);

        var fimPrimeiroMes = trimestre.DataInicio.AddMonths(1);
        var inicioUltimoMes = trimestre.DataInicio.AddMonths(2);

        var exerciciosSemProgresso = new List<SugestaoExercicioDto>();

        foreach (var grupo in sessoes.GroupBy(s => s.NomeExercicio))
        {
            var doPrimeiroMes = grupo.Where(s => s.Data < fimPrimeiroMes)
                .SelectMany(s => s.Series.Where(e => e.OrdemEstagio == 0)).ToList();
            var doUltimoMes = grupo.Where(s => s.Data >= inicioUltimoMes)
                .SelectMany(s => s.Series.Where(e => e.OrdemEstagio == 0)).ToList();

            if (doPrimeiroMes.Count == 0 || doUltimoMes.Count == 0) continue;

            var cargaInicial = doPrimeiroMes.Average(e => e.CargaKg);
            var cargaFinal = doUltimoMes.Average(e => e.CargaKg);

            if (cargaFinal <= cargaInicial)
            {
                exerciciosSemProgresso.Add(new SugestaoExercicioDto(
                    grupo.Key, Math.Round(cargaInicial, 1), Math.Round(cargaFinal, 1)));
            }
        }

        return new SugestaoTrocaTreinoDto(true, exerciciosSemProgresso);
    }
}