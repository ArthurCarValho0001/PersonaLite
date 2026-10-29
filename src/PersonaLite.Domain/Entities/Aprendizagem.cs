using System.Text.Json;

namespace PersonaLite.Domain.Entities;

public record AulaEducativa(string Id, string Titulo, string Texto, string Fonte);
public record AlternativaEducativa(string Id, string Texto);
public record QuestaoEducativa(string Id, string Enunciado, List<AlternativaEducativa> Alternativas, string Correta, string Explicacao);
public record ConteudoEducativo(List<AulaEducativa> Aulas, List<QuestaoEducativa> Questoes);

public class ModuloVersao
{
    public Guid Id { get; set; }
    public string ModuloId { get; set; } = "";
    public int Versao { get; set; }
    public string Titulo { get; set; } = "";
    public string Objetivo { get; set; } = "";
    public string Autoria { get; set; } = "";
    public string Revisao { get; set; } = "";
    public DateTime PublicadoEm { get; set; }
    public bool Retirada { get; set; }
    public bool Demonstracao { get; set; }
    public string ConteudoJson { get; set; } = "";

    public ConteudoEducativo Conteudo() => JsonSerializer.Deserialize<ConteudoEducativo>(ConteudoJson)
        ?? throw new InvalidOperationException("Conteúdo indisponível.");

    public void Validar()
    {
        var c = Conteudo();
        if (string.IsNullOrWhiteSpace(ModuloId) || string.IsNullOrWhiteSpace(Titulo) || string.IsNullOrWhiteSpace(Objetivo)
            || string.IsNullOrWhiteSpace(Autoria) || string.IsNullOrWhiteSpace(Revisao) || Versao < 1
            || c.Aulas is null || c.Questoes is null || c.Aulas.Count != 2 || c.Questoes.Count != 5
            || c.Aulas.Select(a => a?.Id).Distinct().Count() != 2
            || c.Questoes.Select(q => q?.Id).Distinct().Count() != 5
            || c.Aulas.Any(a => a is null || string.IsNullOrWhiteSpace(a.Id) || string.IsNullOrWhiteSpace(a.Titulo) || string.IsNullOrWhiteSpace(a.Texto) || string.IsNullOrWhiteSpace(a.Fonte))
            || c.Questoes.Any(q => q is null || string.IsNullOrWhiteSpace(q.Id) || string.IsNullOrWhiteSpace(q.Enunciado) || q.Alternativas is null || q.Alternativas.Any(a => a is null || string.IsNullOrWhiteSpace(a.Id) || string.IsNullOrWhiteSpace(a.Texto)) || q.Alternativas.Count != 4 || q.Alternativas.Select(a => a.Id).Distinct().Count() != 4
                || q.Alternativas.Count(a => a.Id == q.Correta) != 1 || string.IsNullOrWhiteSpace(q.Explicacao)))
            throw new InvalidOperationException("Pacote educativo inválido: exige duas aulas e cinco questões com quatro alternativas.");
    }

    public int Corrigir(IReadOnlyDictionary<string, string> respostas)
    {
        var questoes = Conteudo().Questoes;
        if (respostas.Count != questoes.Count || questoes.Any(q => !respostas.TryGetValue(q.Id, out var a)
            || !q.Alternativas.Any(x => x.Id == a)))
            throw new InvalidOperationException("Responda todas as cinco questões com alternativas desta versão.");
        return questoes.Count(q => respostas[q.Id] == q.Correta) * 20;
    }
}

public class AulaEstudada
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UsuarioId { get; set; }
    public Guid ModuloVersaoId { get; set; }
    public string AulaId { get; set; } = "";
    public DateTime EstudadaEm { get; set; } = DateTime.UtcNow;
}

public class TentativaEducativa
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UsuarioId { get; set; }
    public Guid ModuloVersaoId { get; set; }
    public int Nota { get; set; }
    public DateTime EnviadaEm { get; set; } = DateTime.UtcNow;
    public string RespostasJson { get; set; } = "";
}

public class OperacaoProcessada
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UsuarioId { get; set; }
    public string Chave { get; set; } = "";
    public string Rota { get; set; } = "";
    public string Hash { get; set; } = "";
    public string Resposta { get; set; } = "";
    public int Status { get; set; }
    public DateTime CriadaEm { get; set; } = DateTime.UtcNow;
}
