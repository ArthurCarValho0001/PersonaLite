namespace PersonaLite.Application.DTOs;

// Usado só na edição: traz também os valores brutos das dobras
// (a RegistroMedidasDto normal só traz o %gordura já calculado)
public record RegistroMedidasDetalhadoDto(
    Guid Id,
    DateOnly Data,
    double PesoKg,
    double Pescoco, double ToraxMesoesternal, double ToraxMamilo, double UltimaCostela,
    double Cintura, double Quadril, double BracoEsquerdo, double BracoDireito,
    double AntebracoEsquerdo, double AntebracoDireito, double PernaEsquerda, double PernaDireita,
    double PanturrilhaEsquerda, double PanturrilhaDireita,
    double Peitoral, double AxilarMedia, double Triceps, double Subescapular,
    double Abdominal, double Suprailiaca, double CoxaDobra);
