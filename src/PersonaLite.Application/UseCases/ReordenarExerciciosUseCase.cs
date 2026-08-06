using PersonaLite.Application.DTOs;
using PersonaLite.Application.Interfaces;

namespace PersonaLite.Application.UseCases;

public class ReordenarExerciciosUseCase
{
    private readonly IPlanoTreinoRepository _planoRepo;

    public ReordenarExerciciosUseCase(IPlanoTreinoRepository planoRepo)
    {
        _planoRepo = planoRepo;
    }

    public async Task ExecutarAsync(Guid usuarioId, Guid diaDeTreinoId, ReordenarExerciciosDto dto)
    {
        var dia = await _planoRepo.ObterDiaDeTreinoAsync(diaDeTreinoId)
            ?? throw new InvalidOperationException("Dia de treino não encontrado.");

        var plano = await _planoRepo.ObterAsync(dia.PlanoTreinoId);
        if (plano is null || plano.UsuarioId != usuarioId)
            throw new InvalidOperationException("Dia de treino não encontrado.");

        dia.ReordenarExercicios(dto.OrdemExercicios);
        await _planoRepo.SalvarAlteracoesAsync();
    }
}