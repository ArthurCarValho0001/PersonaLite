using PersonaLite.Domain.Enums;
using PersonaLite.Domain.Services;
using PersonaLite.Domain.ValueObjects;

namespace PersonaLite.Domain.Entities;

public class RegistroMedidas
{
    public Guid Id { get; private set; }
    public Guid UsuarioId { get; private set; }
    public DateOnly Data { get; private set; }
    public double PesoKg { get; private set; }

    public Circunferencias Circunferencias { get; private set; } = null!;
    public DobrasCutaneas Dobras { get; private set; } = null!;

    // Resultados calculados (guardados pra histórico e auditoria)
    public double PercentualGorduraJP7 { get; private set; }
    public double Imc { get; private set; }

    private RegistroMedidas() { }

    public RegistroMedidas(
        Guid usuarioId, DateOnly data, double pesoKg, double alturaCm, int idade, Sexo sexo,
        Circunferencias circunferencias, DobrasCutaneas dobras)
    {
        Id = Guid.NewGuid();
        UsuarioId = usuarioId;
        Data = data;
        PesoKg = pesoKg;
        Circunferencias = circunferencias;
        Dobras = dobras;

        Imc = CalculoImc.Calcular(pesoKg, alturaCm);
        PercentualGorduraJP7 = CalculoComposicaoCorporal.JacksonPollock7Dobras(dobras, idade, sexo);
    }

    public void Atualizar(
        DateOnly data, double pesoKg, double alturaCm, int idade, Sexo sexo,
        Circunferencias circunferencias, DobrasCutaneas dobras)
    {
        Data = data;
        PesoKg = pesoKg;
        Circunferencias = circunferencias;
        Dobras = dobras;
        Imc = CalculoImc.Calcular(pesoKg, alturaCm);
        PercentualGorduraJP7 = CalculoComposicaoCorporal.JacksonPollock7Dobras(dobras, idade, sexo);
    }
}
