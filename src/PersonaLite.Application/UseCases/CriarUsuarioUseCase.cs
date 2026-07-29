using PersonaLite.Application.DTOs;
using PersonaLite.Application.Interfaces;
using PersonaLite.Domain.Entities;

namespace PersonaLite.Application.UseCases;

public class CriarUsuarioUseCase
{
    private readonly IUsuarioRepository _usuarioRepo;

    public CriarUsuarioUseCase(IUsuarioRepository usuarioRepo)
    {
        _usuarioRepo = usuarioRepo;
    }

    public async Task<Guid> ExecutarAsync(CriarUsuarioDto dto)
    {
        var usuario = new Usuario(dto.Nome, dto.Sexo, dto.DataNascimento, dto.AlturaCm);
        await _usuarioRepo.SalvarAsync(usuario);
        return usuario.Id;
    }
}
