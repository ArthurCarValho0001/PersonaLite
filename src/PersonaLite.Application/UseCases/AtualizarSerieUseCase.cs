using PersonaLite.Application.DTOs;
using PersonaLite.Application.Interfaces;

namespace PersonaLite.Application.UseCases;

public class AtualizarSerieUseCase
{
    private readonly IPlanoTreinoRepository _planoRepo;
    private readonly ISessaoExercicioRepository _sessaoRepo;

    public AtualizarSerieUseCase(IPlanoTreinoRepository planoRepo, ISessaoExercicioRepository sessaoRepo)
    {
        _planoRepo = planoRepo;
        _sessaoRepo = sessaoRepo;
    }

    public async Task ExecutarAsync(Guid usuarioId, Guid sessaoExercicioId, int grupoSerie, AtualizarSerieDto dto)
    {
        if (dto.Estagios.Count == 0)
            throw new InvalidOperationException("A série precisa ter pelo menos um estágio (carga + repetições).");

        var sessao = await _sessaoRepo.ObterPorIdAsync(sessaoExercicioId)
            ?? throw new InvalidOperationException("Série não encontrada.");

        await GarantirPosseAsync(usuarioId, sessao.ExercicioPlanejadoId);

        sessao.AtualizarSerie(grupoSerie, dto.Estagios.Select(e => (e.CargaKg, e.Repeticoes)));
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