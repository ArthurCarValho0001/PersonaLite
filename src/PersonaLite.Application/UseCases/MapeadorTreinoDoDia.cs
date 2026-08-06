using PersonaLite.Application.DTOs;
using PersonaLite.Domain.Entities;

namespace PersonaLite.Application.UseCases;

internal static class MapeadorTreinoDoDia
{
    public static ExercicioComRegistrosDto MapearExercicio(ExercicioPlanejado exercicio, SessaoExercicio? sessao)
    {
        var seriesRegistradas = (sessao?.Series ?? new List<SerieRealizada>())
            .GroupBy(s => s.GrupoSerie)
            .OrderBy(g => g.Key)
            .Select(g => new SerieRegistradaDto(
                g.Key,
                g.OrderBy(e => e.OrdemEstagio).Select(e => new EstagioSerieDto(e.CargaKg, e.Repeticoes)).ToList()))
            .ToList();

        return new ExercicioComRegistrosDto(
            exercicio.Id, exercicio.Nome, exercicio.GrupoMuscular, exercicio.SeriesAlvo, exercicio.RepeticoesAlvo,
            sessao?.Id, seriesRegistradas);
    }
}