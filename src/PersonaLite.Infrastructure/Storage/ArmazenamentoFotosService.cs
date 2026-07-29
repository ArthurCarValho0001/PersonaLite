using PersonaLite.Application.Interfaces;

namespace PersonaLite.Infrastructure.Storage;

public class ArmazenamentoFotosService : IArmazenamentoFotosService
{
    private readonly string _pastaBase;

    public ArmazenamentoFotosService(string pastaBase)
    {
        _pastaBase = pastaBase;
    }

    public async Task<string> SalvarAsync(Stream conteudo, string extensao)
    {
        Directory.CreateDirectory(_pastaBase);
        var nomeArquivo = $"{Guid.NewGuid()}{extensao}";
        var caminhoCompleto = Path.Combine(_pastaBase, nomeArquivo);

        await using var arquivo = File.Create(caminhoCompleto);
        await conteudo.CopyToAsync(arquivo);

        return caminhoCompleto;
    }
}
