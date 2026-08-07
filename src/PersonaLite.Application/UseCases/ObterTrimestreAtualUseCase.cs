using PersonaLite.Application.DTOs;
using PersonaLite.Application.Interfaces;

namespace PersonaLite.Application.UseCases;

public class ObterTrimestreAtualUseCase
{
    private readonly ITrimestreRepository _trimestreRepo;

    public ObterTrimestreAtualUseCase(ITrimestreRepository trimestreRepo)
    {
        _trimestreRepo = trimestreRepo;
    }

    public async Task<TrimestreAtualDto?> ExecutarAsync(Guid usuarioId)
    {
        var trimestre = await _trimestreRepo.ObterVigenteAsync(usuarioId);
        if (trimestre is null) return null;

        var hoje = DateOnly.FromDateTime(DateTime.Today);
        var trocaPendente = hoje >= trimestre.DataFimPrevista;

        return new TrimestreAtualDto(trimestre.Numero, trimestre.DataInicio, trimestre.DataFimPrevista, trocaPendente);
    }
}