using PersonaLite.Domain.Enums;
using PersonaLite.Domain.Services;
using PersonaLite.Domain.ValueObjects;
using Xunit;

namespace PersonaLite.Domain.Tests;

public class CalculoComposicaoCorporalTests
{
    [Fact]
    public void Deve_calcular_percentual_gordura_masculino()
    {
        var dobras = new DobrasCutaneas(10, 10, 10, 10, 10, 10, 10);
        var resultado = CalculoComposicaoCorporal.JacksonPollock7Dobras(dobras, 30, Sexo.Masculino);
        Assert.True(resultado > 0 && resultado < 50);
    }

    [Fact]
    public void Deve_calcular_percentual_gordura_feminino()
    {
        var dobras = new DobrasCutaneas(10, 10, 10, 10, 10, 10, 10);
        var resultado = CalculoComposicaoCorporal.JacksonPollock7Dobras(dobras, 30, Sexo.Feminino);
        Assert.True(resultado > 0 && resultado < 50);
    }

    [Fact]
    public void Percentual_gordura_deve_diferir_entre_sexos_com_mesmas_dobras()
    {
        var dobras = new DobrasCutaneas(15, 12, 14, 13, 20, 18, 16);

        var resultadoMasculino = CalculoComposicaoCorporal.JacksonPollock7Dobras(dobras, 25, Sexo.Masculino);
        var resultadoFeminino = CalculoComposicaoCorporal.JacksonPollock7Dobras(dobras, 25, Sexo.Feminino);

        Assert.NotEqual(resultadoMasculino, resultadoFeminino);
    }
}
