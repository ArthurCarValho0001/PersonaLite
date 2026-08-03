using PersonaLite.Application.DTOs;
using PersonaLite.Application.Interfaces;

namespace PersonaLite.Application.UseCases;

public class LoginUseCase
{
    private readonly IUsuarioRepository _usuarioRepo;
    private readonly IPasswordHasher _hasher;
    private readonly ITokenService _tokenService;

    public LoginUseCase(IUsuarioRepository usuarioRepo, IPasswordHasher hasher, ITokenService tokenService)
    {
        _usuarioRepo = usuarioRepo;
        _hasher = hasher;
        _tokenService = tokenService;
    }

    public async Task<TokenDto> ExecutarAsync(LoginDto dto)
    {
        var nomeUsuarioNormalizado = dto.NomeUsuario.Trim().ToLowerInvariant();

        var usuario = await _usuarioRepo.ObterPorNomeUsuarioAsync(nomeUsuarioNormalizado)
            ?? throw new InvalidOperationException("Usuário ou senha inválidos.");

        if (!_hasher.Verificar(dto.Senha, usuario.SenhaHash))
            throw new InvalidOperationException("Usuário ou senha inválidos.");

        var token = _tokenService.GerarToken(usuario.Id, usuario.NomeUsuario);
        return new TokenDto(token, usuario.Id, usuario.Nome);
    }
}
