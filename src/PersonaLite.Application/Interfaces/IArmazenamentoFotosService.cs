namespace PersonaLite.Application.Interfaces;

public interface IArmazenamentoFotosService
{
    Task<string> SalvarAsync(Stream conteudo, string extensao);
}
