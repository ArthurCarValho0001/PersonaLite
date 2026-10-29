using System.Text.Json;
using PersonaLite.Domain.Entities;
using Xunit;
namespace PersonaLite.Domain.Tests;
public class AprendizagemTests
{
    private static ModuloVersao Modulo() => new() {
        ModuloId="demo", Versao=1, Titulo="Demonstração", Objetivo="Testar", Autoria="Fictícia", Revisao="Não editorial",
        ConteudoJson=JsonSerializer.Serialize(new ConteudoEducativo(
            new() {new("a1","Aula 1","Texto fictício","Fonte fictícia"), new("a2","Aula 2","Texto fictício","Fonte fictícia")},
            Enumerable.Range(1,5).Select(i => new QuestaoEducativa($"q{i}","Enunciado",new() {new("a","A"),new("b","B"),new("c","C"),new("d","D")},"a","Explicação fictícia")).ToList()))
    };
    [Theory]
    [InlineData(0,0)] [InlineData(3,60)] [InlineData(4,80)] [InlineData(5,100)]
    public void CorrigeNoServidor(int acertos,int nota) {
        var m=Modulo(); m.Validar();
        Assert.Equal(nota,m.Corrigir(Enumerable.Range(1,5).ToDictionary(i=>$"q{i}",i=>i<=acertos?"a":"b")));
    }
    [Fact] public void RecusaQuestaoAusenteOuAlternativaInexistente() {
        var m=Modulo();
        Assert.Throws<InvalidOperationException>(()=>m.Corrigir(new Dictionary<string,string>()));
        Assert.Throws<InvalidOperationException>(()=>m.Corrigir(Enumerable.Range(1,5).ToDictionary(i=>$"q{i}",i=>"x")));
    }
    [Fact] public void RecusaPacoteSemFonte() {
        var m=Modulo(); var c=m.Conteudo(); c.Aulas[0]=c.Aulas[0] with {Fonte=""}; m.ConteudoJson=JsonSerializer.Serialize(c);
        Assert.Throws<InvalidOperationException>(()=>m.Validar());
    }
}
