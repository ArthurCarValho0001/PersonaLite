using PersonaLite.Application.DTOs;
using PersonaLite.Application.Interfaces;

namespace PersonaLite.Application.UseCases;

public class ObterMedidaUseCase
{
    private readonly IRegistroMedidasRepository _medidasRepo;

    public ObterMedidaUseCase(IRegistroMedidasRepository medidasRepo)
    {
        _medidasRepo = medidasRepo;
    }

    public async Task<RegistroMedidasDetalhadoDto?> ExecutarAsync(Guid id)
    {
        var r = await _medidasRepo.ObterAsync(id);
        if (r is null) return null;

        return new RegistroMedidasDetalhadoDto(
            r.Id, r.Data, r.PesoKg,
            r.Circunferencias.PescocoCm, r.Circunferencias.ToraxMesoesternalCm, r.Circunferencias.ToraxMamiloCm,
            r.Circunferencias.UltimaCostelaCm, r.Circunferencias.CinturaCm, r.Circunferencias.QuadrilCm,
            r.Circunferencias.BracoEsquerdoCm, r.Circunferencias.BracoDireitoCm,
            r.Circunferencias.AntebracoEsquerdoCm, r.Circunferencias.AntebracoDireitoCm,
            r.Circunferencias.PernaEsquerdaCm, r.Circunferencias.PernaDireitaCm,
            r.Circunferencias.PanturrilhaEsquerdaCm, r.Circunferencias.PanturrilhaDireitaCm,
            r.Dobras.PeitoralMm, r.Dobras.AxilarMediaMm, r.Dobras.TricepsMm, r.Dobras.SubescapularMm,
            r.Dobras.AbdominalMm, r.Dobras.SuprailiacaMm, r.Dobras.CoxaMm);
    }
}
