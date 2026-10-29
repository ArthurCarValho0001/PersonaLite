using PersonaLite.Application.Interfaces;

namespace PersonaLite.Application.UseCases;

public class ConcluirTreinoDoDiaUseCase
{
    private readonly IPlanoTreinoRepository _planoRepo;
    private readonly ISessaoExercicioRepository _sessaoRepo;

    private readonly ICalendario _calendario;
    public ConcluirTreinoDoDiaUseCase(IPlanoTreinoRepository planoRepo, ISessaoExercicioRepository sessaoRepo, ICalendario calendario)
    {
        _calendario = calendario;
        _planoRepo = planoRepo;
        _sessaoRepo = sessaoRepo;
    }

    public async Task ExecutarAsync(Guid usuarioId, Guid diaDeTreinoId, DateOnly? data = null)
    {
        var dataAlvo = data ?? _calendario.Hoje;
        if (dataAlvo > _calendario.Hoje) throw new InvalidOperationException("A data do treino não pode estar no futuro.");

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
