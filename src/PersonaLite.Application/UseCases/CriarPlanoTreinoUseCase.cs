using PersonaLite.Application.DTOs;
using PersonaLite.Application.Interfaces;
using PersonaLite.Domain.Entities;

namespace PersonaLite.Application.UseCases;

public class CriarPlanoTreinoUseCase
{
    private readonly IPlanoTreinoRepository _planoRepo;

    public CriarPlanoTreinoUseCase(IPlanoTreinoRepository planoRepo)
    {
        _planoRepo = planoRepo;
    }

    public async Task<Guid> ExecutarAsync(Guid usuarioId, CriarPlanoTreinoDto dto)
    {
        var planoVigente = await _planoRepo.ObterVigenteAsync(usuarioId);
        if (planoVigente is not null)
        {
            planoVigente.Encerrar(dto.InicioVigencia);
            await _planoRepo.SalvarAlteracoesAsync();
        }

        var plano = new PlanoTreino(usuarioId, dto.InicioVigencia);
        await _planoRepo.SalvarAsync(plano);
        return plano.Id;
    }
}
