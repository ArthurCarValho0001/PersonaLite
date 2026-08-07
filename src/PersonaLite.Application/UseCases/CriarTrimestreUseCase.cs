using PersonaLite.Application.Interfaces;
using PersonaLite.Domain.Entities;

namespace PersonaLite.Application.UseCases;

public class CriarTrimestreUseCase
{
    private readonly ITrimestreRepository _trimestreRepo;

    public CriarTrimestreUseCase(ITrimestreRepository trimestreRepo)
    {
        _trimestreRepo = trimestreRepo;
    }

    public async Task<Guid> ExecutarAsync(Guid usuarioId, DateOnly? dataInicio = null)
    {
        var inicio = dataInicio ?? DateOnly.FromDateTime(DateTime.Today);
        var ultimo = await _trimestreRepo.ObterUltimoAsync(usuarioId);

        if (ultimo is not null && ultimo.DataFim is null)
        {
            ultimo.Encerrar(inicio);
            await _trimestreRepo.SalvarAlteracoesAsync();
        }

        var numero = (ultimo?.Numero ?? 0) + 1;
        var trimestre = new Trimestre(usuarioId, numero, inicio);
        await _trimestreRepo.SalvarAsync(trimestre);
        return trimestre.Id;
    }
}