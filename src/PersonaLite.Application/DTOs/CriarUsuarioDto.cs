using PersonaLite.Domain.Enums;

namespace PersonaLite.Application.DTOs;

public record CriarUsuarioDto(
    string Nome,
    Sexo Sexo,
    DateOnly DataNascimento,
    double AlturaCm);
