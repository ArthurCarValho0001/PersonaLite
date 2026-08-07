namespace PersonaLite.Application.DTOs;

public record ResumoSerieDto(double CargaKg, int Repeticoes);

public record SugestaoProgressaoDto(string Aumentar, string Manter);

public record UltimoTreinoExercicioDto(
    DateOnly Data,
    ResumoSerieDto MelhorSerie,
    ResumoSerieDto UltimaSerie,
    SugestaoProgressaoDto Sugestao);