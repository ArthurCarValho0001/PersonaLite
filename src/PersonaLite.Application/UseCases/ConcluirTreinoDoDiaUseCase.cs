using PersonaLite.Application.Interfaces;

namespace PersonaLite.Application.UseCases;

public class ConcluirTreinoDoDiaUseCase
{
    private readonly IPlanoTreinoRepository _planoRepo;
    private readonly ISessaoExercicioRepository _sessaoRepo;

    public ConcluirTreinoDoDiaUseCase(IPlanoTreinoRepository planoRepo, ISessaoExercicioRepository sessaoRepo)
    {
        _planoRepo = planoRepo;
        _sessaoRepo = sessaoRepo;
    }

    public async Task ExecutarAsync(Guid usuarioId, Guid diaDeTreinoId, DateOnly? data = null)
    {
        var dataAlvo = data ?? DateOnly.FromDateTime(DateTime.Today);

        var dia = await _planoRepo.ObterDiaDeTreinoAsync(diaDeTreinoId)
            ?? throw new InvalidOperationException("Dia de treino não encontrado.");

        var plano = await _planoRepo.ObterAsync(dia.PlanoTreinoId);
        if (plano is null || plano.UsuarioId != usuarioId)
            throw new InvalidOperationException("Dia de treino não encontrado.");

        var idsExercicios = dia.Exercicios.Select(e => e.Id).ToList();
        var sessoes = await _sessaoRepo.ListarPorExerciciosEDataAsync(idsExercicios, dataAlvo);

        foreach (var sessao in sessoes.Where(s => !s.Concluida && s.Series.Count > 0))
        {
            sessao.Concluir();
            await _sessaoRepo.AtualizarAsync(sessao);
        }
    }
}