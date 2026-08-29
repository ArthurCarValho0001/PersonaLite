using PersonaLite.Application.Interfaces;

namespace PersonaLite.Application.UseCases;

public class AtualizarAvatarUseCase
{
    private readonly IUsuarioRepository _usuarioRepo;
    private readonly IArmazenamentoFotosService _armazenamento;

    public AtualizarAvatarUseCase(IUsuarioRepository usuarioRepo, IArmazenamentoFotosService armazenamento)
    {
        _usuarioRepo = usuarioRepo;
        _armazenamento = armazenamento;
    }

    public async Task<string> ExecutarAsync(Guid usuarioId, Stream conteudo, string extensao)
    {
        var usuario = await _usuarioRepo.ObterAsync(usuarioId)
            ?? throw new InvalidOperationException("Usuário não encontrado.");

        var caminho = await _armazenamento.SalvarAsync(conteudo, extensao);
        usuario.DefinirAvatar(caminho);
        await _usuarioRepo.AtualizarAsync(usuario);
        return caminho;
    }
}