using PersonaLite.Application.DTOs;
using PersonaLite.Application.Interfaces;

namespace PersonaLite.Application.UseCases;

public class AlterarEmailUseCase
{
    private readonly IUsuarioRepository _usuarioRepo;
    private readonly IPasswordHasher _hasher;

    public AlterarEmailUseCase(IUsuarioRepository usuarioRepo, IPasswordHasher hasher)
    {
        _usuarioRepo = usuarioRepo;
        _hasher = hasher;
    }

    public async Task ExecutarAsync(Guid usuarioId, AlterarEmailDto dto)
    {
        var usuario = await _usuarioRepo.ObterAsync(usuarioId)
            ?? throw new InvalidOperationException("Usuário não encontrado.");

        if (!_hasher.Verificar(dto.SenhaAtual, usuario.SenhaHash))
            throw new InvalidOperationException("Senha atual incorreta.");

        ValidacaoV2.Email(dto.NovoEmail);
        var outro = await _usuarioRepo.ObterPorEmailAsync(dto.NovoEmail.Trim().ToLowerInvariant());
        if (outro is not null && outro.Id != usuarioId) throw new ConflitoException("E-mail já utilizado por outra conta.");
        usuario.AlterarEmail(dto.NovoEmail);
        await _usuarioRepo.AtualizarAsync(usuario);
    }
}
