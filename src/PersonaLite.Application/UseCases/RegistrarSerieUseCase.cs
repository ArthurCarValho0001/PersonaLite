using PersonaLite.Application.DTOs;
using PersonaLite.Application.Interfaces;
using PersonaLite.Domain.Entities;

namespace PersonaLite.Application.UseCases;

public class RegistrarSerieUseCase
{
    private readonly ISessaoExercicioRepository _sessaoRepo;

    public RegistrarSerieUseCase(ISessaoExercicioRepository sessaoRepo)
    {
        _sessaoRepo = sessaoRepo;
    }

    public async Task ExecutarAsync(RegistrarSerieDto dto)
    {
        if (dto.Estagios.Count == 0)
            throw new InvalidOperationException("A série precisa ter pelo menos um estágio (carga + repetições).");

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
