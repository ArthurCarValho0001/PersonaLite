using PersonaLite.Application.DTOs;
using PersonaLite.Application.Interfaces;
using PersonaLite.Domain.Entities;

namespace PersonaLite.Application.UseCases;

public class RegistrarUsuarioUseCase
{
    private readonly IUsuarioRepository _usuarioRepo;
    private readonly IPasswordHasher _hasher;
    private readonly ITokenService _tokenService;
    private readonly ICalendario _calendario;

    public RegistrarUsuarioUseCase(IUsuarioRepository usuarioRepo, IPasswordHasher hasher, ITokenService tokenService, ICalendario calendario)
    {
        _usuarioRepo = usuarioRepo;
        _hasher = hasher;
        _tokenService = tokenService;
        _calendario = calendario;
    }

    public async Task<TokenDto> ExecutarAsync(RegistrarUsuarioDto dto)
    {
        ValidacaoV2.Perfil(dto.Nome, dto.DataNascimento, dto.Sexo, _calendario.Hoje);
        ValidacaoV2.Email(dto.Email);
        if (string.IsNullOrWhiteSpace(dto.NomeUsuario) || dto.NomeUsuario.Trim().Length < 3 || dto.NomeUsuario.Length > 100
            || string.IsNullOrEmpty(dto.Senha) || dto.Senha.Length < 6 || dto.Senha.Length > 256 || !double.IsFinite(dto.AlturaCm) || dto.AlturaCm <= 0)
            throw new ArgumentException("Confira nome de usuário, senha e altura.");
        if (!string.IsNullOrWhiteSpace(dto.Email) && await _usuarioRepo.ObterPorEmailAsync(dto.Email.Trim().ToLowerInvariant()) is not null)
            throw new ConflitoException("E-mail já utilizado por outra conta.");
        var nomeUsuarioNormalizado = dto.NomeUsuario.Trim().ToLowerInvariant();

        var existente = await _usuarioRepo.ObterPorNomeUsuarioAsync(nomeUsuarioNormalizado);
        if (existente is not null)
            throw new InvalidOperationException("Esse nome de usuário já está em uso.");

        var senhaHash = _hasher.Hash(dto.Senha);
        var usuario = new Usuario(dto.Nome, nomeUsuarioNormalizado, senhaHash, dto.Sexo, dto.DataNascimento, dto.AlturaCm, dto.Email);
        await _usuarioRepo.SalvarAsync(usuario);

        var token = _tokenService.GerarToken(usuario.Id, usuario.NomeUsuario, usuario.VersaoSessao);
        return new TokenDto(token, usuario.Id, usuario.Nome);
    }
}
