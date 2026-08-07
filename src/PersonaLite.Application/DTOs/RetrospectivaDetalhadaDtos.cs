namespace PersonaLite.Application.DTOs;

public record ComparativoMesDto(
    double? VolumeTotalPercentual,
    double? MaiorCargaDiferencaKg,
    double? MediaCargaDiferencaKg);

public record ExercicioRetrospectivaDto(
    string Nome,
    int SeriesRealizadas,
    double VolumeTotal,
    double MaiorCarga,
    ResumoSerieDto? MelhorSerie,
    double MediaCarga,
    double MediaRepeticoes,
    ComparativoMesDto? Comparativo);

public record TreinoRetrospectivaDto(string NomeDia, List<ExercicioRetrospectivaDto> Exercicios);

public record RetrospectivaDetalhadaDto(DateOnly MesReferencia, List<TreinoRetrospectivaDto> Treinos);