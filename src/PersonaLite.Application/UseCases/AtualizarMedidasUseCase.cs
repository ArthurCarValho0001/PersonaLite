using PersonaLite.Application.DTOs;
using PersonaLite.Application.Interfaces;
using PersonaLite.Domain.ValueObjects;

namespace PersonaLite.Application.UseCases;

public class AtualizarMedidasUseCase
{
    private readonly IUsuarioRepository _usuarioRepo;
    private readonly IRegistroMedidasRepository _medidasRepo;

    public AtualizarMedidasUseCase(IUsuarioRepository usuarioRepo, IRegistroMedidasRepository medidasRepo)
    {
        _usuarioRepo = usuarioRepo;
        _medidasRepo = medidasRepo;
    }

    public async Task ExecutarAsync(Guid usuarioId, Guid id, CriarRegistroMedidasDto dto)
    {
        var usuario = await _usuarioRepo.ObterAsync(usuarioId)
            ?? throw new InvalidOperationException("Usuário não encontrado.");

        var existente = await _medidasRepo.ObterAsync(id);
        if (existente is null || existente.UsuarioId != usuarioId)
            throw new InvalidOperationException("Registro não encontrado.");

        var idade = usuario.IdadeEm(dto.Data);

        var circunferencias = new Circunferencias(
            dto.Pescoco, dto.ToraxMesoesternal, dto.ToraxMamilo, dto.UltimaCostela,
            dto.Cintura, dto.Quadril,
            dto.BracoEsquerdo, dto.BracoDireito, dto.AntebracoEsquerdo, dto.AntebracoDireito,
            dto.PernaEsquerda, dto.PernaDireita, dto.PanturrilhaEsquerda, dto.PanturrilhaDireita);

        var dobras = new DobrasCutaneas(dto.Peitoral, dto.AxilarMedia, dto.Triceps,
            dto.Subescapular, dto.Abdominal, dto.Suprailiaca, dto.CoxaDobra);

        existente.Atualizar(dto.Data, dto.PesoKg, usuario.AlturaCm, idade, usuario.Sexo, circunferencias, dobras);

        await _medidasRepo.AtualizarAsync(existente);
    }
}
