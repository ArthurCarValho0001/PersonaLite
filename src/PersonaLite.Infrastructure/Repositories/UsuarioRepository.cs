using PersonaLite.Application.Interfaces;
using PersonaLite.Domain.Entities;
using PersonaLite.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace PersonaLite.Infrastructure.Repositories;

public class UsuarioRepository : IUsuarioRepository
{
    private readonly PersonaLiteDbContext _context;

    public UsuarioRepository(PersonaLiteDbContext context)
    {
        _context = context;
    }

    public Task<Usuario?> ObterAsync(Guid id) =>
        _context.Usuarios.FirstOrDefaultAsync(u => u.Id == id);

    public Task<Usuario?> ObterUnicoAsync() =>
        _context.Usuarios.FirstOrDefaultAsync();

    public async Task SalvarAsync(Usuario usuario)
    {
        var existente = await _context.Usuarios.AnyAsync(u => u.Id == usuario.Id);
        if (existente)
            _context.Usuarios.Update(usuario);
        else
            _context.Usuarios.Add(usuario);

        await _context.SaveChangesAsync();
    }
}
