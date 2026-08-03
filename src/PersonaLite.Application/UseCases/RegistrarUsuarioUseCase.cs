using PersonaLite.Application.DTOs;
using PersonaLite.Application.Interfaces;
using PersonaLite.Domain.Entities;

namespace PersonaLite.Application.UseCases;

public class RegistrarUsuarioUseCase
{
    private readonly IUsuarioRepository _usuarioRepo;
    private readonly IPasswordHasher _hasher;
    private readonly ITokenService _tokenService;

    public RegistrarUsuarioUseCase(IUsuarioRepository usuarioRepo, IPasswordHasher hasher, ITokenService tokenService)
    {
        _usuarioRepo = usuarioRepo;
        _hasher = hasher;
        _tokenService = tokenService;
    }

    public async Task<TokenDto> ExecutarAsync(RegistrarUsuarioDto dto)
    {
        var nomeUsuarioNormalizado = dto.NomeUsuario.Trim().ToLowerInvariant();

        var existente = await _usuarioRepo.ObterPorNomeUsuarioAsync(nomeUsuarioNormalizado);
        if (existente is not null)
            throw new InvalidOperationException("Esse nome de usuário já está em uso.");

        var senhaHash = _hasher.Hash(dto.Senha);
        var usuario = new Usuario(dto.Nome, nomeUsuarioNormalizado, senhaHash, dto.Sexo, dto.DataNascimento, dto.AlturaCm);
        await _usuarioRepo.SalvarAsync(usuario);

        var token = _tokenService.GerarToken(usuario.Id, usuario.NomeUsuario);
        return new TokenDto(token, usuario.Id, usuario.Nome);
    }
}
