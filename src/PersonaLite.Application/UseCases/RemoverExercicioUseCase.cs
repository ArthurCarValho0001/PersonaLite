using PersonaLite.Application.Interfaces;

namespace PersonaLite.Application.UseCases;

public class RemoverExercicioUseCase
{
    private readonly IPlanoTreinoRepository _planoRepo;

    public RemoverExercicioUseCase(IPlanoTreinoRepository planoRepo)
    {
        _planoRepo = planoRepo;
    }

    public async Task ExecutarAsync(Guid usuarioId, Guid exercicioId)
    {
        var exercicio = await _planoRepo.ObterExercicioAsync(exercicioId)
            ?? throw new InvalidOperationException("Exercício não encontrado.");

        var dia = await _planoRepo.ObterDiaDeTreinoAsync(exercicio.DiaDeTreinoId)
            ?? throw new InvalidOperationException("Exercício não encontrado.");

        var plano = await _planoRepo.ObterAsync(dia.PlanoTreinoId);
        if (plano is null || plano.UsuarioId != usuarioId)
            throw new InvalidOperationException("Exercício não encontrado.");

        dia.RemoverExercicio(exercicioId);
        await _planoRepo.SalvarAlteracoesAsync();
    }
}