using PersonaLite.Application.DTOs;
using PersonaLite.Application.Interfaces;

namespace PersonaLite.Application.UseCases;

public class AtualizarInformacoesPessoaisUseCase
{
    private readonly IUsuarioRepository _usuarioRepo;
    private readonly IRegistroMedidasRepository _medidasRepo;
    private readonly ICalendario _calendario;

    public AtualizarInformacoesPessoaisUseCase(IUsuarioRepository usuarioRepo, IRegistroMedidasRepository medidasRepo, ICalendario calendario)
    {
        _usuarioRepo = usuarioRepo;
        _medidasRepo = medidasRepo;
        _calendario = calendario;
    }

    public async Task ExecutarAsync(Guid usuarioId, AtualizarInformacoesPessoaisDto dto)
    {
        var usuario = await _usuarioRepo.ObterAsync(usuarioId)
            ?? throw new InvalidOperationException("Usuário não encontrado.");

        ValidacaoV2.Perfil(dto.Nome, dto.DataNascimento, dto.Sexo, _calendario.Hoje);
        usuario.AtualizarInformacoesPessoais(dto.Nome, dto.DataNascimento, dto.Sexo, dto.Metas, dto.AlturaCm);
        var medidas = await _medidasRepo.ListarPorUsuarioAsync(usuarioId);
        foreach (var medida in medidas) medida.Recalcular(usuario);
        await _usuarioRepo.AtualizarAsync(usuario);
    }
}
