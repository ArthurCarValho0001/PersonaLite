using PersonaLite.Application.DTOs;
using PersonaLite.Application.Interfaces;

namespace PersonaLite.Application.UseCases;

public class ObterTreinoDoDiaUseCase
{
    private readonly IPlanoTreinoRepository _planoRepo;
    private readonly ISessaoExercicioRepository _sessaoRepo;

    private readonly ICalendario _calendario;
    public ObterTreinoDoDiaUseCase(IPlanoTreinoRepository planoRepo, ISessaoExercicioRepository sessaoRepo, ICalendario calendario)
    {
        _calendario = calendario;
        _planoRepo = planoRepo;
        _sessaoRepo = sessaoRepo;
    }

    public async Task<TreinoDoDiaDto> ExecutarAsync(Guid usuarioId, DateOnly? data = null)
    {
        var dataAlvo = data ?? _calendario.Hoje;

        if (dataAlvo > _calendario.Hoje) throw new InvalidOperationException("A data do treino não pode estar no futuro.");
        var plano = dataAlvo == _calendario.Hoje ? await _planoRepo.ObterVigenteAsync(usuarioId)
            : (await _planoRepo.ListarAsync(usuarioId)).FirstOrDefault(p => p.InicioVigencia <= dataAlvo && (p.FimVigencia == null || p.FimVigencia >= dataAlvo));
        var diaDeHoje = plano?.Dias.FirstOrDefault(d => d.DiaSemana == dataAlvo.DayOfWeek);

        if (diaDeHoje is null)
        {
            return new TreinoDoDiaDto(null, null, dataAlvo.DayOfWeek, TemTreinoHoje: false, Exercicios: new List<ExercicioComRegistrosDto>());
        }

        var idsExercicios = diaDeHoje.Exercicios.Select(e => e.Id).ToList();
        var sessoesDeHoje = await _sessaoRepo.ListarPorExerciciosEDataAsync(idsExercicios, dataAlvo);
        var sessoesPorExercicio = sessoesDeHoje.ToDictionary(s => s.ExercicioPlanejadoId);

        var anteriores = await _sessaoRepo.ObterUltimasSessoesAsync(usuarioId, idsExercicios, dataAlvo);
        var exercicios = new List<ExercicioComRegistrosDto>();
        foreach (var e in diaDeHoje.Exercicios.Where(e => !e.Arquivado || dataAlvo < _calendario.Hoje || sessoesPorExercicio.ContainsKey(e.Id)).OrderBy(e => e.Ordem))
        {
            var dto = MapeadorTreinoDoDia.Mapear(e, sessoesPorExercicio.GetValueOrDefault(e.Id), anteriores.GetValueOrDefault(e.Id));
            exercicios.Add(dto);
        }

        return new TreinoDoDiaDto(diaDeHoje.Id, diaDeHoje.Nome, diaDeHoje.DiaSemana, TemTreinoHoje: true, Exercicios: exercicios);
    }
}
