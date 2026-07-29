using PersonaLite.Application.Interfaces;
using PersonaLite.Domain.Entities;
using PersonaLite.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace PersonaLite.Infrastructure.Repositories;

public class RegistroMedidasRepository : IRegistroMedidasRepository
{
    private readonly PersonaLiteDbContext _context;

    public RegistroMedidasRepository(PersonaLiteDbContext context)
    {
        _context = context;
    }

    public Task<RegistroMedidas?> ObterAsync(Guid id) =>
        _context.RegistrosMedidas.FirstOrDefaultAsync(r => r.Id == id);

    public Task<List<RegistroMedidas>> ListarPorUsuarioAsync(Guid usuarioId) =>
        _context.RegistrosMedidas
            .Where(r => r.UsuarioId == usuarioId)
            .OrderBy(r => r.Data)
            .ToListAsync();

    public Task<RegistroMedidas?> ObterMaisRecenteAsync(Guid usuarioId) =>
        _context.RegistrosMedidas
            .Where(r => r.UsuarioId == usuarioId)
            .OrderByDescending(r => r.Data)
            .FirstOrDefaultAsync();

    public async Task SalvarAsync(RegistroMedidas registro)
    {
        _context.RegistrosMedidas.Add(registro);
        await _context.SaveChangesAsync();
    }

    public async Task AtualizarAsync(RegistroMedidas registro)
    {
        // A entidade já está sendo rastreada pelo DbContext (foi carregada via ObterAsync
        // na mesma requisição), então só precisa salvar as mudanças.
        await _context.SaveChangesAsync();
    }
}
