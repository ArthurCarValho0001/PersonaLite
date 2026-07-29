namespace PersonaLite.Application.DTOs;

public record CriarRegistroMedidasDto(
    DateOnly Data,
    double PesoKg,

    // Circunferências (fita métrica)
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
    double PanturrilhaDireita,

    // Dobras cutâneas (adipômetro) — protocolo Jackson & Pollock 7 dobras
    double Peitoral, double AxilarMedia, double Triceps, double Subescapular,
    double Abdominal, double Suprailiaca, double CoxaDobra);
