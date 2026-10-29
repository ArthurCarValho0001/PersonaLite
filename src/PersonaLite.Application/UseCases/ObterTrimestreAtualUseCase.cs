using PersonaLite.Application.DTOs;
using PersonaLite.Application.Interfaces;

namespace PersonaLite.Application.UseCases;

public class ObterTrimestreAtualUseCase
{
    private readonly ITrimestreRepository _trimestreRepo;

    private readonly ICalendario _calendario;
    public ObterTrimestreAtualUseCase(ITrimestreRepository trimestreRepo, ICalendario calendario)
    {
        _calendario = calendario;
        _trimestreRepo = trimestreRepo;
    }

    public async Task<TrimestreAtualDto?> ExecutarAsync(Guid usuarioId)
    {
        var trimestre = await _trimestreRepo.ObterVigenteAsync(usuarioId);
        if (trimestre is null) return null;

        var hoje = _calendario.Hoje;
        var trocaPendente = hoje >= trimestre.DataFimPrevista;

        return new TrimestreAtualDto(trimestre.Numero, trimestre.DataInicio, trimestre.DataFimPrevista, trocaPendente);
    }
}
