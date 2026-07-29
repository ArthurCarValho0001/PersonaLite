using PersonaLite.Application.Interfaces;
using PersonaLite.Infrastructure.Data;
using PersonaLite.Infrastructure.Repositories;
using PersonaLite.Infrastructure.Storage;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace PersonaLite.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("PersonaLiteDb")
            ?? "Data Source=personalite.db";

        services.AddDbContext<PersonaLiteDbContext>(options =>
            options.UseSqlite(connectionString));

        services.AddScoped<IUsuarioRepository, UsuarioRepository>();
        services.AddScoped<IRegistroMedidasRepository, RegistroMedidasRepository>();
        services.AddScoped<IPlanoTreinoRepository, PlanoTreinoRepository>();
        services.AddScoped<ISessaoExercicioRepository, SessaoExercicioRepository>();
        services.AddScoped<IFotoProgressoRepository, FotoProgressoRepository>();

        var pastaFotos = configuration["Armazenamento:PastaFotos"] ?? "fotos-progresso";
        services.AddSingleton<IArmazenamentoFotosService>(new ArmazenamentoFotosService(pastaFotos));

        return services;
    }
}
