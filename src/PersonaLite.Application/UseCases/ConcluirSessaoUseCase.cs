using PersonaLite.Application.Interfaces;

namespace PersonaLite.Application.UseCases;

public class ConcluirSessaoUseCase
{
    private readonly IPlanoTreinoRepository _planoRepo;
    private readonly ISessaoExercicioRepository _sessaoRepo;

    public ConcluirSessaoUseCase(IPlanoTreinoRepository planoRepo, ISessaoExercicioRepository sessaoRepo)
    {
        _planoRepo = planoRepo;
        _sessaoRepo = sessaoRepo;
    }

    public async Task ExecutarAsync(Guid usuarioId, Guid sessaoExercicioId)
    {
        var sessao = await _sessaoRepo.ObterPorIdAsync(sessaoExercicioId)
            ?? throw new InvalidOperationException("Sessão não encontrada.");

        var exercicio = await _planoRepo.ObterExercicioAsync(sessao.ExercicioPlanejadoId)
            ?? throw new InvalidOperationException("Sessão não encontrada.");
        var dia = await _planoRepo.ObterDiaDeTreinoAsync(exercicio.DiaDeTreinoId)
            ?? throw new InvalidOperationException("Sessão não encontrada.");
        var plano = await _planoRepo.ObterAsync(dia.PlanoTreinoId);
        if (plano is null || plano.UsuarioId != usuarioId)
            throw new InvalidOperationException("Sessão não encontrada.");

        sessao.Concluir();
        await _sessaoRepo.AtualizarAsync(sessao);
    }
}