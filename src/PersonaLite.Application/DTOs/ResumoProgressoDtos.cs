namespace PersonaLite.Application.DTOs;

public record DestaqueProgressoDto(string Tipo, string Titulo, string Descricao);

public record ResumoProgressoDto(
    string Periodo,
    int Treinos,
    double VolumeTotal,
    DestaqueProgressoDto? Destaque);