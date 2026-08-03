using PersonaLite.Application.DTOs;
using PersonaLite.Application.Interfaces;

namespace PersonaLite.Application.UseCases;

public class ObterEvolucaoUseCase
{
    private readonly IRegistroMedidasRepository _medidasRepo;

    public ObterEvolucaoUseCase(IRegistroMedidasRepository medidasRepo)
    {
        _medidasRepo = medidasRepo;
    }

    public async Task<List<RegistroMedidasDto>> ExecutarAsync(Guid usuarioId)
    {
        var registros = await _medidasRepo.ListarPorUsuarioAsync(usuarioId);

        return registros
            .OrderBy(r => r.Data)
            .Select(r => new RegistroMedidasDto(
                r.Id, r.Data, r.PesoKg, r.Imc, r.PercentualGorduraJP7,
                r.Circunferencias.PescocoCm, r.Circunferencias.ToraxMesoesternalCm, r.Circunferencias.ToraxMamiloCm,
                r.Circunferencias.UltimaCostelaCm, r.Circunferencias.CinturaCm, r.Circunferencias.QuadrilCm,
                r.Circunferencias.BracoEsquerdoCm, r.Circunferencias.BracoDireitoCm,
                r.Circunferencias.AntebracoEsquerdoCm, r.Circunferencias.AntebracoDireitoCm,
                r.Circunferencias.PernaEsquerdaCm, r.Circunferencias.PernaDireitaCm,
                r.Circunferencias.PanturrilhaEsquerdaCm, r.Circunferencias.PanturrilhaDireitaCm))
            .ToList();
    }
}
