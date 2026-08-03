using PersonaLite.Domain.Enums;

namespace PersonaLite.Application.DTOs;

public record RegistrarUsuarioDto(
    string Nome,
    string NomeUsuario,
    string Senha,
    Sexo Sexo,
    DateOnly DataNascimento,
    double AlturaCm);

public record LoginDto(string NomeUsuario, string Senha);

public record TokenDto(string Token, Guid UsuarioId, string Nome);
