using PersonaLite.Application.DTOs;
using PersonaLite.Application.Interfaces;
using PersonaLite.Domain.Entities;

namespace PersonaLite.Application.UseCases;

internal static class MapeadorTreinoDoDia
{
    public static async Task<ExercicioComRegistrosDto> MapearExercicioAsync(
        Guid usuarioId, ExercicioPlanejado exercicio, SessaoExercicio? sessao, DateOnly dataAlvo,
        ISessaoExercicioRepository sessaoRepo)
    {
        var seriesRegistradas = MapearSeries(sessao);

        var nomeNormalizado = exercicio.Nome.Trim().ToLowerInvariant();
        var ultimaSessao = await sessaoRepo.ObterUltimaSessaoPorNomeExercicioAsync(usuarioId, nomeNormalizado, dataAlvo);

        UltimoDesempenhoDto? ultimoDesempenho = ultimaSessao is null
            ? null
            : new UltimoDesempenhoDto(ultimaSessao.Data, MapearSeries(ultimaSessao));

        return new ExercicioComRegistrosDto(
            exercicio.Id, exercicio.Nome, exercicio.GrupoMuscular, exercicio.SeriesAlvo, exercicio.RepeticoesAlvo,
            sessao?.Id, sessao?.Concluida ?? false, seriesRegistradas, ultimoDesempenho);
    }

    private static List<SerieRegistradaDto> MapearSeries(SessaoExercicio? sessao) =>
        (sessao?.Series ?? new List<SerieRealizada>())
            .GroupBy(s => s.GrupoSerie)
            .OrderBy(g => g.Key)
            .Select(g => new SerieRegistradaDto(
                g.Key,
                g.OrderBy(e => e.OrdemEstagio).Select(e => new EstagioSerieDto(e.CargaKg, e.Repeticoes)).ToList()))
            .ToList();
}