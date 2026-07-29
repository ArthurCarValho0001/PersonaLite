using PersonaLite.Application.DTOs;
using PersonaLite.Application.Interfaces;

namespace PersonaLite.Application.UseCases;

public class ObterProgressaoCargaUseCase
{
    private readonly ISessaoExercicioRepository _sessaoRepo;

    public ObterProgressaoCargaUseCase(ISessaoExercicioRepository sessaoRepo)
    {
        _sessaoRepo = sessaoRepo;
    }

    public async Task<List<PontoProgressaoCargaDto>> ExecutarAsync(Guid exercicioPlanejadoId)
    {
        var sessoes = await _sessaoRepo.ListarPorExercicioAsync(exercicioPlanejadoId);

        return sessoes
            .OrderBy(s => s.Data)
            .Select(s => new PontoProgressaoCargaDto(s.Data, s.CargaMaxima()))
            .ToList();
    }
}
