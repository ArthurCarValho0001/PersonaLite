using PersonaLite.Application.DTOs;
using PersonaLite.Application.Interfaces;
using PersonaLite.Domain.Entities;

namespace PersonaLite.Application.UseCases;

public class AdicionarExercicioUseCase
{
    private readonly IPlanoTreinoRepository _planoRepo;

    public AdicionarExercicioUseCase(IPlanoTreinoRepository planoRepo)
    {
        _planoRepo = planoRepo;
    }

    public async Task<Guid> ExecutarAsync(Guid usuarioId, Guid diaDeTreinoId, AdicionarExercicioDto dto)
    {
        var dia = await _planoRepo.ObterDiaDeTreinoAsync(diaDeTreinoId)
            ?? throw new InvalidOperationException("Dia de treino não encontrado.");

        var plano = await _planoRepo.ObterAsync(dia.PlanoTreinoId);
        if (plano is null || plano.UsuarioId != usuarioId)
            throw new InvalidOperationException("Dia de treino não encontrado.");

        var proximaOrdem = dia.Exercicios.Count == 0 ? 0 : dia.Exercicios.Max(e => e.Ordem) + 1;
        var exercicio = new ExercicioPlanejado(dia.Id, dto.Nome, dto.GrupoMuscular, dto.SeriesAlvo, dto.RepeticoesAlvo, proximaOrdem);
        dia.AdicionarExercicio(exercicio);

        await _planoRepo.SalvarAlteracoesAsync();
        return exercicio.Id;
    }
}
