using PersonaLite.Application.Interfaces;
using PersonaLite.Domain.Entities;
using PersonaLite.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace PersonaLite.Infrastructure.Repositories;

public class FotoProgressoRepository : IFotoProgressoRepository
{
    private readonly PersonaLiteDbContext _context;

    public FotoProgressoRepository(PersonaLiteDbContext context)
    {
        _context = context;
    }

    public Task<List<FotoProgresso>> ListarPorRegistroAsync(Guid registroMedidasId) =>
        _context.FotosProgresso
            .Where(f => f.RegistroMedidasId == registroMedidasId)
            .ToListAsync();

    public async Task SalvarAsync(FotoProgresso foto)
    {
        _context.FotosProgresso.Add(foto);
        await _context.SaveChangesAsync();
    }
}
