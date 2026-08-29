using PersonaLite.Domain.Entities;
using PersonaLite.Domain.Enums;

namespace PersonaLite.Application.Interfaces;

public interface ICodigoVerificacaoRepository
{
    Task<CodigoVerificacao?> ObterValidoAsync(Guid usuarioId, string codigo, PropositoCodigo proposito);
    Task SalvarAsync(CodigoVerificacao codigo);
    Task AtualizarAsync(CodigoVerificacao codigo);
}