using PersonaLite.Domain.Services;
using Xunit;

namespace PersonaLite.Domain.Tests;

public class CalculoImcTests
{
    [Theory]
    [InlineData(70, 175, 22.86)]
    [InlineData(90, 180, 27.78)]
    public void Deve_calcular_imc_corretamente(double pesoKg, double alturaCm, double esperado)
    {
        var resultado = CalculoImc.Calcular(pesoKg, alturaCm);
        Assert.Equal(esperado, resultado, 2);
    }

    [Theory]
    [InlineData(17, "Abaixo do peso")]
    [InlineData(22, "Peso normal")]
    [InlineData(27, "Sobrepeso")]
    [InlineData(32, "Obesidade grau I")]
    [InlineData(37, "Obesidade grau II")]
    [InlineData(42, "Obesidade grau III")]
    public void Deve_classificar_imc_corretamente(double imc, string esperado)
    {
        var resultado = CalculoImc.Classificar(imc);
        Assert.Equal(esperado, resultado);
    }
}
