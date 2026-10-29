using PersonaLite.Application.DTOs;
using PersonaLite.Application.Interfaces;

namespace PersonaLite.Application.UseCases;

public class ObterTreinoPorDiaUseCase
{
    private readonly IPlanoTreinoRepository _planoRepo;
    private readonly ISessaoExercicioRepository _sessaoRepo;

    private readonly ICalendario _calendario;
    public ObterTreinoPorDiaUseCase(IPlanoTreinoRepository planoRepo, ISessaoExercicioRepository sessaoRepo, ICalendario calendario)
    {
        _calendario = calendario;
        _planoRepo = planoRepo;
        _sessaoRepo = sessaoRepo;
    }

    public async Task<TreinoDoDiaDto> ExecutarAsync(Guid usuarioId, Guid diaDeTreinoId, DateOnly? data = null)
    {
        var dataAlvo = data ?? _calendario.Hoje;
        if (dataAlvo > _calendario.Hoje) throw new InvalidOperationException("A data do treino não pode estar no futuro.");

        var dia = await _planoRepo.ObterDiaDeTreinoAsync(diaDeTreinoId)
            ?? throw new InvalidOperationException("Dia de treino não encontrado.");

        var plano = await _planoRepo.ObterAsync(dia.PlanoTreinoId);
        if (plano is null || plano.UsuarioId != usuarioId)
            throw new InvalidOperationException("Dia de treino não encontrado.");

        var idsExercicios = dia.Exercicios.Select(e => e.Id).ToList();
        var sessoes = await _sessaoRepo.ListarPorExerciciosEDataAsync(idsExercicios, dataAlvo);
        var sessoesPorExercicio = sessoes.ToDictionary(s => s.ExercicioPlanejadoId);

        var anteriores = await _sessaoRepo.ObterUltimasSessoesAsync(usuarioId, idsExercicios, dataAlvo);
        var exercicios = new List<ExercicioComRegistrosDto>();
        foreach (var e in dia.Exercicios.Where(e => !e.Arquivado || dataAlvo < _calendario.Hoje || sessoesPorExercicio.ContainsKey(e.Id)).OrderBy(e => e.Ordem))
        {
            var dto = MapeadorTreinoDoDia.Mapear(e, sessoesPorExercicio.GetValueOrDefault(e.Id), anteriores.GetValueOrDefault(e.Id));
            exercicios.Add(dto);
        }

        return new TreinoDoDiaDto(dia.Id, dia.Nome, dia.DiaSemana, TemTreinoHoje: true, Exercicios: exercicios);
    }
}
