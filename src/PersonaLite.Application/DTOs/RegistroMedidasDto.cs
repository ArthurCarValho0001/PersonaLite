namespace PersonaLite.Application.DTOs;

public record RegistroMedidasDto(
    Guid Id,
    DateOnly Data,
    double PesoKg,
    double Imc,
    double PercentualGorduraJP7,
    double Pescoco,
    double ToraxMesoesternal,
    double ToraxMamilo,
    double UltimaCostela,
    double Cintura,
    double Quadril,
    double BracoEsquerdo,
    double BracoDireito,
    double AntebracoEsquerdo,
    double AntebracoDireito,
    double PernaEsquerda,
    double PernaDireita,
    double PanturrilhaEsquerda,
    double PanturrilhaDireita);
