using PersonaLite.Application.Interfaces;

namespace PersonaLite.Application.UseCases;

public class RemoverSerieUseCase
{
    private readonly IPlanoTreinoRepository _planoRepo;
    private readonly ISessaoExercicioRepository _sessaoRepo;

    public RemoverSerieUseCase(IPlanoTreinoRepository planoRepo, ISessaoExercicioRepository sessaoRepo)
    {
        _planoRepo = planoRepo;
        _sessaoRepo = sessaoRepo;
    }

    public async Task ExecutarAsync(Guid usuarioId, Guid sessaoExercicioId, int grupoSerie)
    {
        var sessao = await _sessaoRepo.ObterPorIdAsync(sessaoExercicioId)
            ?? throw new InvalidOperationException("Série não encontrada.");

        await GarantirPosseAsync(usuarioId, sessao.ExercicioPlanejadoId);

        sessao.RemoverSerie(grupoSerie);
        await _sessaoRepo.AtualizarAsync(sessao);
    }

    private async Task GarantirPosseAsync(Guid usuarioId, Guid exercicioPlanejadoId)
    {
        var exercicio = await _planoRepo.ObterExercicioAsync(exercicioPlanejadoId)
            ?? throw new InvalidOperationException("Série não encontrada.");

        var dia = await _planoRepo.ObterDiaDeTreinoAsync(exercicio.DiaDeTreinoId)
            ?? throw new InvalidOperationException("Série não encontrada.");

        var plano = await _planoRepo.ObterAsync(dia.PlanoTreinoId);
        if (plano is null || plano.UsuarioId != usuarioId)
            throw new InvalidOperationException("Série não encontrada.");
    }
}