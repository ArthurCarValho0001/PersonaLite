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

        var ultimoTreino = MontarUltimoTreino(ultimaSessao);

        return new ExercicioComRegistrosDto(
            exercicio.Id, exercicio.Nome, exercicio.GrupoMuscular, exercicio.SeriesAlvo, exercicio.RepeticoesAlvo,
            sessao?.Id, sessao?.Concluida ?? false, seriesRegistradas, ultimoTreino);
    }

    private static List<SerieRegistradaDto> MapearSeries(SessaoExercicio? sessao) =>
        (sessao?.Series ?? new List<SerieRealizada>())
            .GroupBy(s => s.GrupoSerie)
            .OrderBy(g => g.Key)
            .Select(g => new SerieRegistradaDto(
                g.Key,
                g.OrderBy(e => e.OrdemEstagio).Select(e => new EstagioSerieDto(e.CargaKg, e.Repeticoes)).ToList()))
            .ToList();

    private static UltimoTreinoExercicioDto? MontarUltimoTreino(SessaoExercicio? ultimaSessao)
    {
        if (ultimaSessao is null || ultimaSessao.Series.Count == 0) return null;

        var grupos = ultimaSessao.Series
            .GroupBy(s => s.GrupoSerie)
            .Select(g => new
            {
                GrupoSerie = g.Key,
                Volume = g.Sum(e => e.CargaKg * e.Repeticoes),
                CargaPrincipal = g.First(e => e.OrdemEstagio == 0).CargaKg,
                RepsPrincipal = g.First(e => e.OrdemEstagio == 0).Repeticoes,
            })
            .ToList();

        var melhor = grupos.OrderByDescending(g => g.Volume).First();
        var ultima = grupos.OrderByDescending(g => g.GrupoSerie).First();

        var melhorSerie = new ResumoSerieDto(melhor.CargaPrincipal, melhor.RepsPrincipal);
        var ultimaSerie = new ResumoSerieDto(ultima.CargaPrincipal, ultima.RepsPrincipal);

        var sugestao = new SugestaoProgressaoDto(
            Aumentar: "Tente aumentar a carga e realizar entre 8 e 12 repetições.",
            Manter: $"Mantenha {FormatarPeso(melhor.CargaPrincipal)}kg e tente realizar entre {melhor.RepsPrincipal + 1} e {melhor.RepsPrincipal + 3} repetições.");

        return new UltimoTreinoExercicioDto(ultimaSessao.Data, melhorSerie, ultimaSerie, sugestao);
    }

    private static string FormatarPeso(double peso) => peso % 1 == 0 ? peso.ToString("0") : peso.ToString("0.#");
}