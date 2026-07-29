namespace PersonaLite.Application.DTOs;

public record EstagioSerieDto(double CargaKg, int Repeticoes);

/// <summary>
/// Registra UMA série. Se "Estagios" tiver só 1 item, é uma série normal.
/// Se tiver 2+ itens, é um drop set (ex: 40kg 12rep, depois 35kg 5rep na sequência).
/// </summary>
public record RegistrarSerieDto(
    Guid ExercicioPlanejadoId,
    DateOnly Data,
    List<EstagioSerieDto> Estagios);

public record SerieRegistradaDto(int GrupoSerie, List<EstagioSerieDto> Estagios);

public record ExercicioComRegistrosDto(
    Guid ExercicioPlanejadoId,
    string Nome,
    string GrupoMuscular,
    int SeriesAlvo,
    int RepeticoesAlvo,
    List<SerieRegistradaDto> SeriesRegistradas);

public record TreinoDoDiaDto(
    string? NomeDia,
    DayOfWeek DiaSemana,
    bool TemTreinoHoje,
    List<ExercicioComRegistrosDto> Exercicios);

public record PontoProgressaoCargaDto(DateOnly Data, double CargaMaximaKg);
