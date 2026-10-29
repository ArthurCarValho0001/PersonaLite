using System.Text.Json;
using PersonaLite.Application.Interfaces;
using PersonaLite.Domain.Entities;
namespace PersonaLite.Application.UseCases;

public class AprendizagemService(IAprendizagemRepository repo)
{
    private async Task<ModuloVersao> VersaoAsync(Guid id, bool permitirRetirada = false)
    {
        var versao = (await repo.ModulosAsync()).SingleOrDefault(m => m.Id == id);
        if (versao is null || (versao.Retirada && !permitirRetirada))
            throw new KeyNotFoundException("Esta versão não está disponível. Consulte seu histórico.");
        return versao;
    }

    public async Task<object> CatalogoAsync(Guid usuarioId)
    {
        var modulos = await repo.ModulosAsync();
        var aulas = await repo.AulasAsync(usuarioId);
        var tentativas = await repo.TentativasAsync(usuarioId);
        return modulos.GroupBy(m => m.ModuloId)
            .Select(g => g.OrderByDescending(m => m.Versao).First()).Where(m => !m.Retirada).OrderBy(m => m.ModuloId)
            .Select(m => new {
                m.Id, m.ModuloId, m.Versao, m.Titulo, m.Objetivo, m.Demonstracao,
                AulasEstudadas = aulas.Count(a => a.ModuloVersaoId == m.Id),
                MelhorNota = tentativas.Where(t => t.ModuloVersaoId == m.Id).Select(t => (int?)t.Nota).Max(),
                VersaoConcluida = modulos.Where(v => v.ModuloId == m.ModuloId && tentativas.Any(t => t.ModuloVersaoId == v.Id && t.Nota >= 80))
                    .Select(v => (int?)v.Versao).Max()
            }).ToList();
    }

    public async Task<object> DetalheAsync(Guid usuarioId, Guid id)
    {
        var v = await VersaoAsync(id);
        var aulas = await repo.AulasAsync(usuarioId);
        var c = v.Conteudo();
        return new { v.Id, v.ModuloId, v.Versao, v.Titulo, v.Objetivo, v.Autoria, v.Revisao, v.PublicadoEm, v.Demonstracao,
            Aulas = c.Aulas.Select(a => new { a.Id, a.Titulo, a.Texto, a.Fonte,
                Estudada = aulas.Any(e => e.ModuloVersaoId == id && e.AulaId == a.Id) }),
            AvaliacaoLiberada = c.Aulas.All(a => aulas.Any(e => e.ModuloVersaoId == id && e.AulaId == a.Id)) };
    }

    public async Task MarcarAulaAsync(Guid usuarioId, Guid id, string aulaId)
    {
        var v = await VersaoAsync(id);
        if (!v.Conteudo().Aulas.Any(a => a.Id == aulaId)) throw new KeyNotFoundException("Aula não encontrada.");
        if ((await repo.AulasAsync(usuarioId)).Any(a => a.ModuloVersaoId == id && a.AulaId == aulaId)) return;
        await repo.SalvarAulaAsync(new AulaEstudada { UsuarioId = usuarioId, ModuloVersaoId = id, AulaId = aulaId });
    }

    private async Task<ModuloVersao> ElegivelAsync(Guid usuarioId, Guid id)
    {
        var v = await VersaoAsync(id);
        var aulas = await repo.AulasAsync(usuarioId);
        if (!v.Conteudo().Aulas.All(a => aulas.Any(e => e.ModuloVersaoId == id && e.AulaId == a.Id)))
            throw new InvalidOperationException("Estude as duas aulas desta versão antes da avaliação.");
        return v;
    }

    public async Task<object> QuestionarioAsync(Guid usuarioId, Guid id)
    {
        var v = await ElegivelAsync(usuarioId, id);
        return new { v.Id, v.Titulo, v.Versao,
            Questoes = v.Conteudo().Questoes.Select(q => new { q.Id, q.Enunciado, q.Alternativas }) };
    }

    public async Task<object> EnviarAsync(Guid usuarioId, Guid id, Dictionary<string, string> respostas)
    {
        var v = await ElegivelAsync(usuarioId, id);
        var nota = v.Corrigir(respostas);
        var t = new TentativaEducativa { UsuarioId = usuarioId, ModuloVersaoId = id, Nota = nota, RespostasJson = JsonSerializer.Serialize(respostas) };
        await repo.SalvarTentativaAsync(t);
        return new { t.Id, t.Nota, t.EnviadaEm, Aprovada = t.Nota >= 80 };
    }

    private static object Resultado(ModuloVersao v, TentativaEducativa t) => new {
        t.Id, t.ModuloVersaoId, t.Nota, t.EnviadaEm, Aprovada = t.Nota >= 80,
        Explicacoes = v.Retirada ? null : v.Conteudo().Questoes.Select(q => new { q.Id, q.Explicacao, q.Correta }).ToList()
    };

    public async Task<object> HistoricoAsync(Guid usuarioId)
    {
        var modulos = await repo.ModulosAsync();
        var aulas = await repo.AulasAsync(usuarioId);
        var tentativas = await repo.TentativasAsync(usuarioId);
        return modulos.Where(v => aulas.Any(a => a.ModuloVersaoId == v.Id) || tentativas.Any(t => t.ModuloVersaoId == v.Id))
            .Select(v => new { v.Id, v.ModuloId, v.Titulo, v.Versao, v.Retirada,
                AulasEstudadas = aulas.Where(a => a.ModuloVersaoId == v.Id).Select(a => new { a.AulaId, a.EstudadaEm }),
                Concluido = tentativas.Any(t => t.ModuloVersaoId == v.Id && t.Nota >= 80),
                Tentativas = tentativas.Where(t => t.ModuloVersaoId == v.Id).OrderByDescending(t => t.EnviadaEm)
                    .Select(t => new { t.Id, t.Nota, t.EnviadaEm }) }).ToList();
    }

    public async Task<object> ResultadoAsync(Guid usuarioId, Guid tentativaId)
    {
        var t = (await repo.TentativasAsync(usuarioId)).SingleOrDefault(t => t.Id == tentativaId)
            ?? throw new KeyNotFoundException("Tentativa não encontrada.");
        return Resultado(await VersaoAsync(t.ModuloVersaoId, true), t);
    }
}
