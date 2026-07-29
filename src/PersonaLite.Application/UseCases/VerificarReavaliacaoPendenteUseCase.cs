using PersonaLite.Application.Interfaces;

namespace PersonaLite.Application.UseCases;

public class VerificarReavaliacaoPendenteUseCase
{
    private const int MesesParaReavaliacao = 3;

    private readonly IUsuarioRepository _usuarioRepo;
    private readonly IRegistroMedidasRepository _medidasRepo;

    public VerificarReavaliacaoPendenteUseCase(IUsuarioRepository usuarioRepo, IRegistroMedidasRepository medidasRepo)
    {
        _usuarioRepo = usuarioRepo;
        _medidasRepo = medidasRepo;
    }

    public async Task<ReavaliacaoStatusDto> ExecutarAsync()
    {
        var usuario = await _usuarioRepo.ObterUnicoAsync()
            ?? throw new InvalidOperationException("Usuário não configurado.");

        var ultimoRegistro = await _medidasRepo.ObterMaisRecenteAsync(usuario.Id);

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
