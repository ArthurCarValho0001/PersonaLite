using PersonaLite.Application.DTOs;
using PersonaLite.Application.Interfaces;

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
            return new TreinoDoDiaDto(null, null, dataAlvo.DayOfWeek, TemTreinoHoje: false, Exercicios: new List<ExercicioComRegistrosDto>());
        }

        var idsExercicios = diaDeHoje.Exercicios.Select(e => e.Id).ToList();
        var sessoesDeHoje = await _sessaoRepo.ListarPorExerciciosEDataAsync(idsExercicios, dataAlvo);
        var sessoesPorExercicio = sessoesDeHoje.ToDictionary(s => s.ExercicioPlanejadoId);

        var exercicios = new List<ExercicioComRegistrosDto>();
        foreach (var e in diaDeHoje.Exercicios.OrderBy(e => e.Ordem))
        {
            var dto = await MapeadorTreinoDoDia.MapearExercicioAsync(
                usuarioId, e, sessoesPorExercicio.GetValueOrDefault(e.Id), dataAlvo, _sessaoRepo);
            exercicios.Add(dto);
        }

        return new TreinoDoDiaDto(diaDeHoje.Id, diaDeHoje.Nome, diaDeHoje.DiaSemana, TemTreinoHoje: true, Exercicios: exercicios);
    }
}