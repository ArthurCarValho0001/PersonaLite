using PersonaLite.Application.Interfaces;
using PersonaLite.Infrastructure.Data;
using PersonaLite.Infrastructure.Repositories;
using PersonaLite.Infrastructure.Storage;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PersonaLite.Infrastructure.Security;

namespace PersonaLite.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException(
                "Connection string 'DefaultConnection' não configurada. " +
                "Configure via User Secrets (local) ou variável de ambiente ConnectionStrings__DefaultConnection (produção).");

        services.AddDbContext<PersonaLiteDbContext>(options =>
            options.UseNpgsql(connectionString));

        services.AddScoped<IUsuarioRepository, UsuarioRepository>();
        services.AddScoped<IRegistroMedidasRepository, RegistroMedidasRepository>();
        services.AddScoped<IPlanoTreinoRepository, PlanoTreinoRepository>();
        services.AddScoped<ISessaoExercicioRepository, SessaoExercicioRepository>();
        services.AddScoped<IFotoProgressoRepository, FotoProgressoRepository>();
        services.AddScoped<IPasswordHasher, PasswordHasher>();
        services.AddScoped<ITokenService, TokenService>();

        var pastaFotos = configuration["Armazenamento:PastaFotos"] ?? "fotos-progresso";
        services.AddSingleton<IArmazenamentoFotosService>(new ArmazenamentoFotosService(pastaFotos));

        return services;
    }
}