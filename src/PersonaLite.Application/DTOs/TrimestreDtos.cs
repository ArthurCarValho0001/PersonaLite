namespace PersonaLite.Application.DTOs;

public record TrimestreAtualDto(
    int Numero,
    DateOnly DataInicio,
    DateOnly DataFimPrevista,
    bool TrocaPendente);

public record RetrospectivaMesDto(
    int NumeroMes,
    DateOnly InicioMes,
    int TotalSeries,
    double MediaRepeticoes,
    double MediaCargaKg);

public record RetrospectivaTrimestreDto(
    int NumeroTrimestre,
    DateOnly DataInicio,
    List<RetrospectivaMesDto> Meses);

public record SugestaoExercicioDto(string NomeExercicio, double CargaMesInicial, double CargaMesAtual);

public record SugestaoTrocaTreinoDto(bool TrocaPendente, List<SugestaoExercicioDto> ExerciciosSemProgresso);