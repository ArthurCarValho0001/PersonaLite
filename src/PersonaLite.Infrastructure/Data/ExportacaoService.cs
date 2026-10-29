using System.Globalization;
using System.IO.Compression;
using System.Text;
using Microsoft.EntityFrameworkCore;
using PersonaLite.Application.Interfaces;
namespace PersonaLite.Infrastructure.Data;

public class ExportacaoService(PersonaLiteDbContext db) : IExportacaoService
{
    public static string Celula(object? valor)
    {
        var s = valor switch { null => "", DateOnly d => d.ToString("yyyy-MM-dd"), DateTime d => d.ToUniversalTime().ToString("O"), IFormattable f => f.ToString(null, CultureInfo.InvariantCulture), _ => valor.ToString() ?? "" };
        // Preserve the source text and prevent spreadsheet formula evaluation.
        if (s.TrimStart().StartsWith('=') || s.TrimStart().StartsWith('+') || s.TrimStart().StartsWith('-') || s.TrimStart().StartsWith('@') || s.StartsWith('\t') || s.StartsWith('\r')) s = "'" + s;
        return "\"" + s.Replace("\"", "\"\"") + "\"";
    }
    private static void Csv<T>(ZipArchive zip, string nome, IEnumerable<T> registros)
    {
        using var writer = new StreamWriter(zip.CreateEntry(nome + ".csv").Open(), new UTF8Encoding(true));
        var props = typeof(T).GetProperties();
        writer.WriteLine(string.Join(",", props.Select(p => Celula(p.Name))));
        foreach (var registro in registros) writer.WriteLine(string.Join(",", props.Select(p => Celula(p.GetValue(registro)))));
    }
    public async Task<byte[]> ExportarAsync(Guid usuarioId)
    {
        await using var tx = await db.Database.BeginTransactionAsync(System.Data.IsolationLevel.RepeatableRead);
        var instante = DateTime.UtcNow;
        using var stream = new MemoryStream();
        using (var zip = new ZipArchive(stream, ZipArchiveMode.Create, true)) {
            Csv(zip, "perfil", await db.Usuarios.Where(u => u.Id == usuarioId).Select(u => new { u.Id, u.Nome, u.NomeUsuario, u.Email, u.EmailVerificado, u.DataNascimento, u.Sexo, u.AlturaCm, u.Metas, u.TempoDescansoSegundos }).ToListAsync());
            Csv(zip, "medidas", await db.RegistrosMedidas.Where(r => r.UsuarioId == usuarioId).Select(r => new { r.Id, r.Data, r.PesoKg, r.Imc, r.PercentualGorduraJP7,
                r.Circunferencias.PescocoCm, r.Circunferencias.ToraxMesoesternalCm, r.Circunferencias.ToraxMamiloCm, r.Circunferencias.UltimaCostelaCm, r.Circunferencias.CinturaCm, r.Circunferencias.QuadrilCm,
                r.Circunferencias.BracoEsquerdoCm, r.Circunferencias.BracoDireitoCm, r.Circunferencias.AntebracoEsquerdoCm, r.Circunferencias.AntebracoDireitoCm, r.Circunferencias.PernaEsquerdaCm, r.Circunferencias.PernaDireitaCm, r.Circunferencias.PanturrilhaEsquerdaCm, r.Circunferencias.PanturrilhaDireitaCm,
                r.Dobras.PeitoralMm, r.Dobras.AxilarMediaMm, r.Dobras.TricepsMm, r.Dobras.SubescapularMm, r.Dobras.AbdominalMm, r.Dobras.SuprailiacaMm, r.Dobras.CoxaMm, r.VersaoFormula, r.EntradasCalculoJson }).ToListAsync());
            var planos = db.PlanosTreino.Where(p => p.UsuarioId == usuarioId);
            var dias = db.DiasDeTreino.Where(d => planos.Any(p => p.Id == d.PlanoTreinoId));
            var exercicios = db.ExerciciosPlanejados.Where(e => dias.Any(d => d.Id == e.DiaDeTreinoId));
            var sessoes = db.SessoesExercicio.Where(s => exercicios.Any(e => e.Id == s.ExercicioPlanejadoId));
            Csv(zip, "planos", await planos.Select(p => new { p.Id, p.InicioVigencia, p.FimVigencia }).ToListAsync());
            Csv(zip, "dias", await dias.Select(d => new { d.Id, d.PlanoTreinoId, d.Nome, d.DiaSemana }).ToListAsync());
            Csv(zip, "exercicios", await exercicios.Select(e => new { e.Id, e.DiaDeTreinoId, e.Nome, e.GrupoMuscular, e.SeriesAlvo, e.RepeticoesAlvo, e.Ordem, e.Arquivado }).ToListAsync());
            Csv(zip, "sessoes", await sessoes.Select(s => new { s.Id, s.ExercicioPlanejadoId, s.Data, s.Concluida }).ToListAsync());
            Csv(zip, "series", await sessoes.SelectMany(s => s.Series.Select(e => new { SessaoId = s.Id, e.Id, e.GrupoSerie, e.OrdemEstagio, e.CargaKg, e.Repeticoes })).ToListAsync());
            Csv(zip, "ciclos", await db.Trimestres.Where(t => t.UsuarioId == usuarioId).Select(t => new { t.Id, t.Numero, t.DataInicio, t.DataFim }).ToListAsync());
            Csv(zip, "aulas_estudadas", await db.AulasEstudadas.Where(a => a.UsuarioId == usuarioId).Select(a => new { a.Id, a.ModuloVersaoId, a.AulaId, a.EstudadaEm }).ToListAsync());
            Csv(zip, "tentativas", await db.TentativasEducativas.Where(t => t.UsuarioId == usuarioId).Select(t => new { t.Id, t.ModuloVersaoId, t.Nota, t.EnviadaEm, t.RespostasJson }).ToListAsync());
            using var info = new StreamWriter(zip.CreateEntry("LEIA-ME.txt").Open(), Encoding.UTF8);
            info.Write($"PersonaLite — formato CSV v1\nReferência UTC: {instante:O}\nSomente dados confirmados no servidor neste instante. Pendências deste ou de outros aparelhos não estão incluídas. Sem arquivo do avatar e sem credenciais.\nUnidades: peso/carga em kg, altura/circunferências em cm, dobras em mm, descanso em segundos, nota em %. Datas de negócio yyyy-MM-dd; instantes em UTC. IDs ligam planos, dias, exercícios, sessões e séries.\nUTF-8, vírgula, campos entre aspas. Campos que poderiam ser interpretados como fórmulas recebem apóstrofo de proteção. Não há alteração dos dados originais.\n");
        }
        await tx.CommitAsync(); return stream.ToArray();
    }
}
