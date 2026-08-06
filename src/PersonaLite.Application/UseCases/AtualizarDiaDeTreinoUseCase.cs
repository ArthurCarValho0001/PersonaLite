using PersonaLite.Application.DTOs;
using PersonaLite.Application.Interfaces;

namespace PersonaLite.Application.UseCases;

public class AtualizarDiaDeTreinoUseCase
{
    private readonly IPlanoTreinoRepository _planoRepo;

    public AtualizarDiaDeTreinoUseCase(IPlanoTreinoRepository planoRepo)
    {
        _planoRepo = planoRepo;
    }

    public async Task ExecutarAsync(Guid usuarioId, Guid diaDeTreinoId, AtualizarDiaDeTreinoDto dto)
    {
        var dia = await _planoRepo.ObterDiaDeTreinoAsync(diaDeTreinoId)
            ?? throw new InvalidOperationException("Dia de treino não encontrado.");

        var plano = await _planoRepo.ObterAsync(dia.PlanoTreinoId);
        if (plano is null || plano.UsuarioId != usuarioId)
            throw new InvalidOperationException("Dia de treino não encontrado.");

        dia.Atualizar(dto.Nome, dto.DiaSemana);
        await _planoRepo.SalvarAlteracoesAsync();
    }
}