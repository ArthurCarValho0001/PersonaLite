using PersonaLite.Domain.Enums;
using PersonaLite.Domain.ValueObjects;

namespace PersonaLite.Domain.Services;

public static class CalculoComposicaoCorporal
{
    public static double JacksonPollock7Dobras(DobrasCutaneas dobras, int idade, Sexo sexo)
    {
        var soma = dobras.Soma7Dobras;
        var soma2 = soma * soma;

        double densidade = sexo switch
        {
            Sexo.Masculino => 1.112 - 0.00043499 * soma + 0.00000055 * soma2 - 0.00028826 * idade,
            Sexo.Feminino => 1.097 - 0.00046971 * soma + 0.00000056 * soma2 - 0.00012828 * idade,
            _ => throw new ArgumentOutOfRangeException(nameof(sexo))
        };

        // Equação de Siri
        var percentualGordura = (495 / densidade) - 450;
        return Math.Round(percentualGordura, 2);
    }
}
