using PersonaLite.Application.DTOs;
using PersonaLite.Application.Interfaces;
using PersonaLite.Domain.Entities;

namespace PersonaLite.Application.UseCases;

public class AdicionarFotoProgressoUseCase
{
    private readonly IArmazenamentoFotosService _armazenamento;
    private readonly IFotoProgressoRepository _fotoRepo;

    public AdicionarFotoProgressoUseCase(IArmazenamentoFotosService armazenamento, IFotoProgressoRepository fotoRepo)
    {
        _armazenamento = armazenamento;
        _fotoRepo = fotoRepo;
    }

    public async Task<Guid> ExecutarAsync(AdicionarFotoProgressoDto dto)
    {
        var caminho = await _armazenamento.SalvarAsync(dto.Conteudo, dto.Extensao);
        var foto = new FotoProgresso(dto.RegistroMedidasId, dto.Angulo, caminho);

        await _fotoRepo.SalvarAsync(foto);
        return foto.Id;
    }
}
