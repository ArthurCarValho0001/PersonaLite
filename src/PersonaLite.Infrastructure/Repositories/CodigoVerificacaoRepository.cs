using PersonaLite.Application.Interfaces;
using PersonaLite.Domain.Entities;
using PersonaLite.Domain.Enums;
using PersonaLite.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace PersonaLite.Infrastructure.Repositories;

public class CodigoVerificacaoRepository : ICodigoVerificacaoRepository
{
    private readonly PersonaLiteDbContext _context;

    public CodigoVerificacaoRepository(PersonaLiteDbContext context)
    {
        _context = context;
    }

    public Task<CodigoVerificacao?> ObterValidoAsync(Guid usuarioId, string codigo, PropositoCodigo proposito) =>
        _context.CodigosVerificacao
            .Where(c => c.UsuarioId == usuarioId && c.Codigo == codigo && c.Proposito == proposito && !c.Usado)
            .OrderByDescending(c => c.CriadoEmUtc)
            .FirstOrDefaultAsync(c => c.ExpiraEmUtc >= DateTime.UtcNow);

    public async Task SalvarAsync(CodigoVerificacao codigo)
    {
        _context.CodigosVerificacao.Add(codigo);
        await _context.SaveChangesAsync();
    }

    public async Task AtualizarAsync(CodigoVerificacao codigo)
    {
        await _context.SaveChangesAsync();
    }
}
