using PersonaLite.Application.Interfaces;

namespace PersonaLite.Application.UseCases;

public class VerificarReavaliacaoPendenteUseCase
{
    private const int MesesParaReavaliacao = 3;

    private readonly IRegistroMedidasRepository _medidasRepo;

    public VerificarReavaliacaoPendenteUseCase(IRegistroMedidasRepository medidasRepo)
    {
        _medidasRepo = medidasRepo;
    }

    public async Task<ReavaliacaoStatusDto> ExecutarAsync(Guid usuarioId)
    {
        var ultimoRegistro = await _medidasRepo.ObterMaisRecenteAsync(usuarioId);

        if (ultimoRegistro is null)
            return new ReavaliacaoStatusDto(Pendente: false, ProximaData: null, UltimaMedicao: null);

        var proximaData = ultimoRegistro.Data.AddMonths(MesesParaReavaliacao);
        var hoje = DateOnly.FromDateTime(DateTime.Today);

        return new ReavaliacaoStatusDto(
            Pendente: hoje >= proximaData,
            ProximaData: proximaData,
            UltimaMedicao: ultimoRegistro.Data);
    }
}

public record ReavaliacaoStatusDto(bool Pendente, DateOnly? ProximaData, DateOnly? UltimaMedicao);
