using PersonaLite.Application.DTOs;
using PersonaLite.Application.Interfaces;

namespace PersonaLite.Application.UseCases;

public class ObterTreinoPorDiaUseCase
{
    private readonly IPlanoTreinoRepository _planoRepo;
    private readonly ISessaoExercicioRepository _sessaoRepo;

    public ObterTreinoPorDiaUseCase(IPlanoTreinoRepository planoRepo, ISessaoExercicioRepository sessaoRepo)
    {
        _planoRepo = planoRepo;
        _sessaoRepo = sessaoRepo;
    }

    public async Task<TreinoDoDiaDto> ExecutarAsync(Guid usuarioId, Guid diaDeTreinoId, DateOnly? data = null)
    {
        var dataAlvo = data ?? DateOnly.FromDateTime(DateTime.Today);

        var dia = await _planoRepo.ObterDiaDeTreinoAsync(diaDeTreinoId)
            ?? throw new InvalidOperationException("Dia de treino não encontrado.");

        var plano = await _planoRepo.ObterAsync(dia.PlanoTreinoId);
        if (plano is null || plano.UsuarioId != usuarioId)
            throw new InvalidOperationException("Dia de treino não encontrado.");

        var idsExercicios = dia.Exercicios.Select(e => e.Id).ToList();
        var sessoes = await _sessaoRepo.ListarPorExerciciosEDataAsync(idsExercicios, dataAlvo);
        var sessoesPorExercicio = sessoes.ToDictionary(s => s.ExercicioPlanejadoId);

        var exercicios = new List<ExercicioComRegistrosDto>();
        foreach (var e in dia.Exercicios.OrderBy(e => e.Ordem))
        {
            var dto = await MapeadorTreinoDoDia.MapearExercicioAsync(
                usuarioId, e, sessoesPorExercicio.GetValueOrDefault(e.Id), dataAlvo, _sessaoRepo);
            exercicios.Add(dto);
        }

        return new TreinoDoDiaDto(dia.Id, dia.Nome, dia.DiaSemana, TemTreinoHoje: true, Exercicios: exercicios);
    }
}