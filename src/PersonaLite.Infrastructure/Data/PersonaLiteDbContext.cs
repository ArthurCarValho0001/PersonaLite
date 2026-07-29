using PersonaLite.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace PersonaLite.Infrastructure.Data;

public class PersonaLiteDbContext : DbContext
{
    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<RegistroMedidas> RegistrosMedidas => Set<RegistroMedidas>();
    public DbSet<PlanoTreino> PlanosTreino => Set<PlanoTreino>();
    public DbSet<DiaDeTreino> DiasDeTreino => Set<DiaDeTreino>();
    public DbSet<ExercicioPlanejado> ExerciciosPlanejados => Set<ExercicioPlanejado>();
    public DbSet<SessaoExercicio> SessoesExercicio => Set<SessaoExercicio>();
    public DbSet<FotoProgresso> FotosProgresso => Set<FotoProgresso>();

    public PersonaLiteDbContext(DbContextOptions<PersonaLiteDbContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // IDs são gerados no domínio (Guid.NewGuid() nos construtores), não pelo banco.
        // Sem isso, o EF trata entidades novas com chave já preenchida como Modified e tenta
        // UPDATE em vez de INSERT — causando DbUpdateConcurrencyException ao adicionar filhos.
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            var idProperty = entityType.FindProperty("Id");
            if (idProperty?.ClrType == typeof(Guid))
                idProperty.ValueGenerated = Microsoft.EntityFrameworkCore.Metadata.ValueGenerated.Never;
        }

        // Value Objects embutidos (owned types) — não viram tabela própria
        modelBuilder.Entity<RegistroMedidas>().OwnsOne(r => r.Dobras);
        modelBuilder.Entity<RegistroMedidas>().OwnsOne(r => r.Circunferencias);

        // PlanoTreino -> DiaDeTreino -> ExercicioPlanejado (cascade delete em toda a cadeia)
        modelBuilder.Entity<PlanoTreino>()
            .HasMany(p => p.Dias)
            .WithOne()
            .HasForeignKey(d => d.PlanoTreinoId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<DiaDeTreino>()
            .HasMany(d => d.Exercicios)
            .WithOne()
            .HasForeignKey(e => e.DiaDeTreinoId)
            .OnDelete(DeleteBehavior.Cascade);

        // Cada linha de SerieRealizada é um "estágio" (GrupoSerie agrupa os estágios de um drop set)
        modelBuilder.Entity<SessaoExercicio>()
            .OwnsMany(s => s.Series, sb =>
            {
                sb.WithOwner().HasForeignKey("SessaoExercicioId");
                sb.Property<int>("Id").ValueGeneratedOnAdd();
                sb.HasKey("SessaoExercicioId", "Id");
            });

        base.OnModelCreating(modelBuilder);
    }
}
