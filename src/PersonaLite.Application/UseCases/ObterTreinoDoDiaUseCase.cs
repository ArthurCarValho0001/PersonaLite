using PersonaLite.Application.DTOs;
using PersonaLite.Application.Interfaces;
using PersonaLite.Domain.Entities;

namespace PersonaLite.Application.UseCases;

public class ObterTreinoDoDiaUseCase
{
    private readonly IPlanoTreinoRepository _planoRepo;
    private readonly ISessaoExercicioRepository _sessaoRepo;

    public ObterTreinoDoDiaUseCase(IPlanoTreinoRepository planoRepo, ISessaoExercicioRepository sessaoRepo)
    {
        _planoRepo = planoRepo;
        _sessaoRepo = sessaoRepo;
    }

    public async Task<TreinoDoDiaDto> ExecutarAsync(Guid usuarioId, DateOnly? data = null)
    {
        var dataAlvo = data ?? DateOnly.FromDateTime(DateTime.Today);

        var plano = await _planoRepo.ObterVigenteAsync(usuarioId);
        var diaDeHoje = plano?.Dias.FirstOrDefault(d => d.DiaSemana == dataAlvo.DayOfWeek);

        if (diaDeHoje is null)
        {
            return new TreinoDoDiaDto(null, dataAlvo.DayOfWeek, TemTreinoHoje: false, Exercicios: new List<ExercicioComRegistrosDto>());
        }

        var idsExercicios = diaDeHoje.Exercicios.Select(e => e.Id).ToList();
        var sessoesDeHoje = await _sessaoRepo.ListarPorExerciciosEDataAsync(idsExercicios, dataAlvo);
        var sessoesPorExercicio = sessoesDeHoje.ToDictionary(s => s.ExercicioPlanejadoId);

        var exercicios = diaDeHoje.Exercicios
            .OrderBy(e => e.Ordem)
            .Select(e => MapearExercicio(e, sessoesPorExercicio.GetValueOrDefault(e.Id)))
            .ToList();

        return new TreinoDoDiaDto(diaDeHoje.Nome, diaDeHoje.DiaSemana, TemTreinoHoje: true, Exercicios: exercicios);
    }

    private static ExercicioComRegistrosDto MapearExercicio(ExercicioPlanejado exercicio, SessaoExercicio? sessao)
    {
        var seriesRegistradas = (sessao?.Series ?? new List<SerieRealizada>())
            .GroupBy(s => s.GrupoSerie)
            .OrderBy(g => g.Key)
            .Select(g => new SerieRegistradaDto(
                g.Key,
                g.OrderBy(e => e.OrdemEstagio).Select(e => new EstagioSerieDto(e.CargaKg, e.Repeticoes)).ToList()))
            .ToList();

        return new ExercicioComRegistrosDto(
            exercicio.Id, exercicio.Nome, exercicio.GrupoMuscular, exercicio.SeriesAlvo, exercicio.RepeticoesAlvo,
            seriesRegistradas);
    }
}