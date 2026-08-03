using PersonaLite.Application.DTOs;
using PersonaLite.Application.Interfaces;
using PersonaLite.Domain.Entities;

namespace PersonaLite.Application.UseCases;

public class RegistrarSerieUseCase
{
    private readonly IPlanoTreinoRepository _planoRepo;
    private readonly ISessaoExercicioRepository _sessaoRepo;

    public RegistrarSerieUseCase(IPlanoTreinoRepository planoRepo, ISessaoExercicioRepository sessaoRepo)
    {
        _planoRepo = planoRepo;
        _sessaoRepo = sessaoRepo;
    }

    public async Task ExecutarAsync(Guid usuarioId, RegistrarSerieDto dto)
    {
        if (dto.Estagios.Count == 0)
            throw new InvalidOperationException("A série precisa ter pelo menos um estágio (carga + repetições).");

        var exercicio = await _planoRepo.ObterExercicioAsync(dto.ExercicioPlanejadoId)
            ?? throw new InvalidOperationException("Exercício não encontrado.");

        var dia = await _planoRepo.ObterDiaDeTreinoAsync(exercicio.DiaDeTreinoId)
            ?? throw new InvalidOperationException("Exercício não encontrado.");

        var plano = await _planoRepo.ObterAsync(dia.PlanoTreinoId);
        if (plano is null || plano.UsuarioId != usuarioId)
            throw new InvalidOperationException("Exercício não encontrado.");

        var sessao = await _sessaoRepo.ObterPorExercicioEDataAsync(dto.ExercicioPlanejadoId, dto.Data);
        var novaSessao = sessao is null;
        sessao ??= new SessaoExercicio(dto.ExercicioPlanejadoId, dto.Data);

        sessao.RegistrarSerie(dto.Estagios.Select(e => (e.CargaKg, e.Repeticoes)));

        if (novaSessao)
            await _sessaoRepo.SalvarAsync(sessao);
        else
            await _sessaoRepo.AtualizarAsync(sessao);
    }
}
