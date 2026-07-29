using PersonaLite.Domain.Entities;

namespace PersonaLite.Application.DTOs;

public record AdicionarFotoProgressoDto(
    Guid RegistroMedidasId,
    AnguloFoto Angulo,
    Stream Conteudo,
    string Extensao);

public record FotoProgressoDto(
    Guid Id,
    AnguloFoto Angulo,
    string CaminhoArquivo);
