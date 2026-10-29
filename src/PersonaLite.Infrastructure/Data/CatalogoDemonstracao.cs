using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using PersonaLite.Domain.Entities;
namespace PersonaLite.Infrastructure.Data;

public static class CatalogoDemonstracao
{
    public static async Task PrepararAsync(PersonaLiteDbContext db)
    {
        var titulos = new[] { "Movimento e bem-estar", "Autocuidado e informação", "Hábitos e sustentabilidade" };
        for (var i = 0; i < titulos.Length; i++)
        {
            var moduloId = $"demo-{i + 1}";
            if (await db.ModulosVersoes.AnyAsync(m => m.ModuloId == moduloId)) continue;
            var aulas = new List<AulaEducativa> {
                new("aula-1", "Conhecer antes de escolher", "Conteúdo fictício para testar o PersonaLite V2. Neste cenário de demonstração, Ana organiza informações sobre sua rotina. Ela distingue um registro pessoal de uma orientação profissional. Anotar uma atividade não comprova resultado clínico. Nesta aula de teste, a palavra-chave é observar. Nenhuma recomendação de saúde é oferecida.", "Roteiro fictício de teste PersonaLite; sem revisão editorial."),
                new("aula-2", "Do registro à reflexão", "Continuação fictícia: Ana revê seus registros e procura fontes identificadas antes de tomar decisões. No cenário, ela pode comparar atividades, estudar em qualquer ordem e retomar sua rotina. Marcar uma aula registra uma ação no aplicativo, sem comprovar aprendizagem ou impacto em saúde. Nesta aula de teste, a palavra-chave é refletir.", "Roteiro fictício de teste PersonaLite; sem revisão editorial.")
            };
            var enunciados = new[] { "Qual palavra aparece como chave na primeira aula?", "Qual palavra aparece como chave na segunda aula?", "O que significa marcar uma aula neste aplicativo?", "Este conteúdo de demonstração tem revisão clínica comprovada?", "O que Ana procura antes de tomar decisões no cenário?" };
            var corretas = new[] { "Observar", "Refletir", "Uma ação de estudo registrada", "Não; é um roteiro fictício", "Fontes identificadas" };
            var questoes = Enumerable.Range(0, 5).Select(n => new QuestaoEducativa($"q-{n + 1}", enunciados[n],
                new List<AlternativaEducativa> { new("a", corretas[n]), new("b", "Um resultado clínico garantido"), new("c", "Uma certificação profissional"), new("d", "Nenhuma informação precisa de fonte") },
                "a", $"No roteiro fictício: {corretas[n]}. A avaliação mede somente respostas nesta demonstração.")).ToList();
            var v = new ModuloVersao { Id = Guid.NewGuid(), ModuloId = moduloId, Versao = 1, Titulo = titulos[i],
                Objetivo = "Explorar estudo, avaliação e progresso com um cenário fictício de demonstração.", Autoria = "Equipe de desenvolvimento — dados fictícios",
                Revisao = "Validação técnica; liberação editorial pendente", PublicadoEm = DateTime.UtcNow, Demonstracao = true,
                ConteudoJson = JsonSerializer.Serialize(new ConteudoEducativo(aulas, questoes)) };
            v.Validar(); db.ModulosVersoes.Add(v);
        }
        await db.SaveChangesAsync();
    }
}
