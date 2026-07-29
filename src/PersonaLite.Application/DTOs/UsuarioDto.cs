using PersonaLite.Domain.Enums;

namespace PersonaLite.Application.DTOs;

public record UsuarioDto(
    Guid Id,
    string Nome,
    Sexo Sexo,
    DateOnly DataNascimento,
    double AlturaCm);
