namespace PersonaLite.Application.DTOs;

public record CriarPlanoTreinoDto(DateOnly InicioVigencia);

public record AdicionarDiaDeTreinoDto(string Nome, DayOfWeek DiaSemana);

public record AdicionarExercicioDto(
    string Nome,
    string GrupoMuscular,
    int SeriesAlvo,
    int RepeticoesAlvo);

public record ExercicioPlanejadoDto(
    Guid Id,
    string Nome,
    string GrupoMuscular,
    int SeriesAlvo,
    int RepeticoesAlvo,
    int Ordem);

public record DiaDeTreinoDto(
    Guid Id,
    string Nome,
    DayOfWeek DiaSemana,
    List<ExercicioPlanejadoDto> Exercicios);

public record PlanoTreinoDto(
    Guid Id,
    DateOnly InicioVigencia,
    DateOnly? FimVigencia,
    List<DiaDeTreinoDto> Dias);

public record AtualizarDiaDeTreinoDto(
    string Nome, 
    DayOfWeek DiaSemana);

public record AtualizarExercicioDto(
    string Nome, 
    string GrupoMuscular, 
    int SeriesAlvo, 
    int RepeticoesAlvo);

public record ReordenarExerciciosDto(List<Guid> OrdemExercicios);
