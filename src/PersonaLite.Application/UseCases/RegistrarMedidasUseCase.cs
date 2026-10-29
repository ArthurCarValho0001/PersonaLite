using PersonaLite.Application.DTOs;
using PersonaLite.Application.Interfaces;
using PersonaLite.Domain.Entities;
using PersonaLite.Domain.ValueObjects;

namespace PersonaLite.Application.UseCases;

public class RegistrarMedidasUseCase
{
    private readonly IUsuarioRepository _usuarioRepo;
    private readonly IRegistroMedidasRepository _medidasRepo;

    private readonly ICalendario _calendario;
    public RegistrarMedidasUseCase(IUsuarioRepository usuarioRepo, IRegistroMedidasRepository medidasRepo, ICalendario calendario)
    {
        _calendario = calendario;
        _usuarioRepo = usuarioRepo;
        _medidasRepo = medidasRepo;
    }

    public async Task<Guid> ExecutarAsync(Guid usuarioId, CriarRegistroMedidasDto dto)
    {
        var usuario = await _usuarioRepo.ObterAsync(usuarioId)
            ?? throw new InvalidOperationException("Usuário não encontrado.");

        ValidacaoV2.Medidas(dto, _calendario.Hoje);
        if ((await _medidasRepo.ListarPorUsuarioAsync(usuarioId)).Any(m => m.Data == dto.Data)) throw new ConflitoException("Já existe uma medição nesta data. Edite o registro existente.");
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

        registro.Recalcular(usuario);
        await _medidasRepo.SalvarAsync(registro);
        return registro.Id;
    }
}
