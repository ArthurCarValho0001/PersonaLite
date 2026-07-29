namespace PersonaLite.Domain.Services;

public static class CalculoImc
{
    public static double Calcular(double pesoKg, double alturaCm)
    {
        var alturaM = alturaCm / 100.0;
        return Math.Round(pesoKg / (alturaM * alturaM), 2);
    }

    public static string Classificar(double imc) => imc switch
    {
        < 18.5 => "Abaixo do peso",
        < 25 => "Peso normal",
        < 30 => "Sobrepeso",
        < 35 => "Obesidade grau I",
        < 40 => "Obesidade grau II",
        _ => "Obesidade grau III"
    };
}
