using PersonaLite.Application.DTOs;
using PersonaLite.Application.Interfaces;

namespace PersonaLite.Application.UseCases;

public class ObterPlanoVigenteUseCase
{
    private readonly IUsuarioRepository _usuarioRepo;
    private readonly IPlanoTreinoRepository _planoRepo;

    public ObterPlanoVigenteUseCase(IUsuarioRepository usuarioRepo, IPlanoTreinoRepository planoRepo)
    {
        _usuarioRepo = usuarioRepo;
        _planoRepo = planoRepo;
    }

    public async Task<PlanoTreinoDto?> ExecutarAsync()
    {
        var usuario = await _usuarioRepo.ObterUnicoAsync()
            ?? throw new InvalidOperationException("Usuário não configurado.");

        var plano = await _planoRepo.ObterVigenteAsync(usuario.Id);
        if (plano is null) return null;

        return new PlanoTreinoDto(
            plano.Id,
            plano.InicioVigencia,
            plano.FimVigencia,
            plano.Dias
                .OrderBy(d => (int)d.DiaSemana)
                .Select(d => new DiaDeTreinoDto(
                    d.Id, d.Nome, d.DiaSemana,
                    d.Exercicios
                        .OrderBy(e => e.Ordem)
                        .Select(e => new ExercicioPlanejadoDto(e.Id, e.Nome, e.GrupoMuscular, e.SeriesAlvo, e.RepeticoesAlvo, e.Ordem))
                        .ToList()))
                .ToList());
    }
}
