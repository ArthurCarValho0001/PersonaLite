using PersonaLite.Application.DTOs;
using PersonaLite.Application.Interfaces;
using PersonaLite.Domain.Entities;

namespace PersonaLite.Application.UseCases;

public class CriarPlanoTreinoUseCase
{
    private readonly IUsuarioRepository _usuarioRepo;
    private readonly IPlanoTreinoRepository _planoRepo;

    public CriarPlanoTreinoUseCase(IUsuarioRepository usuarioRepo, IPlanoTreinoRepository planoRepo)
    {
        _usuarioRepo = usuarioRepo;
        _planoRepo = planoRepo;
    }

    public async Task<Guid> ExecutarAsync(CriarPlanoTreinoDto dto)
    {
        var usuario = await _usuarioRepo.ObterUnicoAsync()
            ?? throw new InvalidOperationException("Usuário não configurado.");

        var planoVigente = await _planoRepo.ObterVigenteAsync(usuario.Id);
        if (planoVigente is not null)
        {
            planoVigente.Encerrar(dto.InicioVigencia);
            await _planoRepo.SalvarAlteracoesAsync();
        }

        var plano = new PlanoTreino(usuario.Id, dto.InicioVigencia);
        await _planoRepo.SalvarAsync(plano);
        return plano.Id;
    }
}
