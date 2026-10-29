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
    public DbSet<Trimestre> Trimestres => Set<Trimestre>();
    public DbSet<CodigoVerificacao> CodigosVerificacao => Set<CodigoVerificacao>();
    public DbSet<ModuloVersao> ModulosVersoes => Set<ModuloVersao>();
    public DbSet<AulaEstudada> AulasEstudadas => Set<AulaEstudada>();
    public DbSet<TentativaEducativa> TentativasEducativas => Set<TentativaEducativa>();
    public DbSet<OperacaoProcessada> OperacoesProcessadas => Set<OperacaoProcessada>();

    public PersonaLiteDbContext(DbContextOptions<PersonaLiteDbContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ModuloVersao>().HasIndex(x => new { x.ModuloId, x.Versao }).IsUnique();
        modelBuilder.Entity<AulaEstudada>().HasIndex(x => new { x.UsuarioId, x.ModuloVersaoId, x.AulaId }).IsUnique();
        modelBuilder.Entity<AulaEstudada>().HasOne<Usuario>().WithMany().HasForeignKey(x => x.UsuarioId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<AulaEstudada>().HasOne<ModuloVersao>().WithMany().HasForeignKey(x => x.ModuloVersaoId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<TentativaEducativa>().HasIndex(x => new { x.UsuarioId, x.ModuloVersaoId });
        modelBuilder.Entity<TentativaEducativa>().HasOne<Usuario>().WithMany().HasForeignKey(x => x.UsuarioId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<TentativaEducativa>().HasOne<ModuloVersao>().WithMany().HasForeignKey(x => x.ModuloVersaoId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<OperacaoProcessada>().HasIndex(x => new { x.UsuarioId, x.Chave }).IsUnique();
        modelBuilder.Entity<RegistroMedidas>().OwnsOne(r => r.Dobras);
        modelBuilder.Entity<RegistroMedidas>().OwnsOne(r => r.Circunferencias);

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

        modelBuilder.Entity<SessaoExercicio>()
            .OwnsMany(s => s.Series, sb =>
            {
                sb.WithOwner().HasForeignKey("SessaoExercicioId");
                sb.HasKey(x => x.Id);
            });

        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            var idProperty = entityType.FindProperty("Id");
            if (idProperty?.ClrType == typeof(Guid))
                idProperty.ValueGenerated = Microsoft.EntityFrameworkCore.Metadata.ValueGenerated.Never;
        }

        base.OnModelCreating(modelBuilder);
    }
}
