using PersonaLite.Application.DTOs;
using PersonaLite.Application.Interfaces;

namespace PersonaLite.Application.UseCases;

public class AdicionarDiaDeTreinoUseCase
{
    private readonly IPlanoTreinoRepository _planoRepo;

    public AdicionarDiaDeTreinoUseCase(IPlanoTreinoRepository planoRepo)
    {
        _planoRepo = planoRepo;
    }

    public async Task<Guid> ExecutarAsync(Guid planoTreinoId, AdicionarDiaDeTreinoDto dto)
    {
        var plano = await _planoRepo.ObterAsync(planoTreinoId)
            ?? throw new InvalidOperationException("Plano de treino não encontrado.");

        var dia = plano.AdicionarDia(dto.Nome, dto.DiaSemana);
        await _planoRepo.SalvarAlteracoesAsync();
        return dia.Id;
    }
}
