using PersonaLite.Application.DTOs;
using PersonaLite.Application.Interfaces;
using PersonaLite.Domain.Entities;
using PersonaLite.Domain.ValueObjects;

namespace PersonaLite.Application.UseCases;

public class RegistrarMedidasUseCase
{
    private readonly IUsuarioRepository _usuarioRepo;
    private readonly IRegistroMedidasRepository _medidasRepo;

    public RegistrarMedidasUseCase(IUsuarioRepository usuarioRepo, IRegistroMedidasRepository medidasRepo)
    {
        _usuarioRepo = usuarioRepo;
        _medidasRepo = medidasRepo;
    }

    public async Task<Guid> ExecutarAsync(CriarRegistroMedidasDto dto)
    {
        var usuario = await _usuarioRepo.ObterUnicoAsync()
            ?? throw new InvalidOperationException("Usuário não configurado.");

        var idade = usuario.IdadeEm(dto.Data);

        var circunferencias = new Circunferencias(
            dto.Pescoco, dto.ToraxMesoesternal, dto.ToraxMamilo, dto.UltimaCostela,
            dto.Cintura, dto.Quadril,
            dto.BracoEsquerdo, dto.BracoDireito, dto.AntebracoEsquerdo, dto.AntebracoDireito,
            dto.PernaEsquerda, dto.PernaDireita, dto.PanturrilhaEsquerda, dto.PanturrilhaDireita);

        var dobras = new DobrasCutaneas(dto.Peitoral, dto.AxilarMedia, dto.Triceps,
            dto.Subescapular, dto.Abdominal, dto.Suprailiaca, dto.CoxaDobra);

        var registro = new RegistroMedidas(usuario.Id, dto.Data, dto.PesoKg, usuario.AlturaCm,
            idade, usuario.Sexo, circunferencias, dobras);

        await _medidasRepo.SalvarAsync(registro);
        return registro.Id;
    }
}
