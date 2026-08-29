using PersonaLite.Domain.Enums;

namespace PersonaLite.Application.DTOs;

public record UsuarioDto(
    Guid Id,
    string Nome,
    string NomeUsuario,
    Sexo Sexo,
    DateOnly DataNascimento,
    double AlturaCm,
    int TempoDescansoSegundos,
    string? Email,
    bool EmailVerificado,
    string? AvatarUrl,
    string? Metas);