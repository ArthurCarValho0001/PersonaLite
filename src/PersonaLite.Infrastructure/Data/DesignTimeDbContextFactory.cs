using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
namespace PersonaLite.Infrastructure.Data;

// Schema tooling uses an explicit environment value, never application secrets.
public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<PersonaLiteDbContext>
{
    public PersonaLiteDbContext CreateDbContext(string[] args)
    {
        var connection = Environment.GetEnvironmentVariable("PERSONALITE_DESIGN_CONNECTION")
            ?? throw new InvalidOperationException("Defina PERSONALITE_DESIGN_CONNECTION para o banco isolado de desenvolvimento.");
        return new(new DbContextOptionsBuilder<PersonaLiteDbContext>().UseNpgsql(connection).Options);
    }
}
