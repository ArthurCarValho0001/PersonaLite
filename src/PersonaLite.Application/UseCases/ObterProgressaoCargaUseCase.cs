using PersonaLite.Application.DTOs;
using PersonaLite.Application.Interfaces;

namespace PersonaLite.Application.UseCases;

public class ObterProgressaoCargaUseCase
{
    private readonly IPlanoTreinoRepository _planoRepo;
    private readonly ISessaoExercicioRepository _sessaoRepo;

    public ObterProgressaoCargaUseCase(IPlanoTreinoRepository planoRepo, ISessaoExercicioRepository sessaoRepo)
    {
        _planoRepo = planoRepo;
        _sessaoRepo = sessaoRepo;
    }

    public async Task<List<PontoProgressaoCargaDto>> ExecutarAsync(Guid usuarioId, Guid exercicioPlanejadoId)
    {
        var exercicio = await _planoRepo.ObterExercicioAsync(exercicioPlanejadoId)
            ?? throw new InvalidOperationException("Exercício não encontrado.");

        var dia = await _planoRepo.ObterDiaDeTreinoAsync(exercicio.DiaDeTreinoId)
            ?? throw new InvalidOperationException("Exercício não encontrado.");

        var plano = await _planoRepo.ObterAsync(dia.PlanoTreinoId);
        if (plano is null || plano.UsuarioId != usuarioId)
            throw new InvalidOperationException("Exercício não encontrado.");

        var sessoes = await _sessaoRepo.ListarPorExercicioAsync(exercicioPlanejadoId);

        return sessoes
            .OrderBy(s => s.Data)
            .Select(s => new PontoProgressaoCargaDto(s.Data, s.CargaMaxima()))
            .ToList();
    }
}
